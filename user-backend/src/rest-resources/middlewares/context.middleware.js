import { v4 as uuid } from 'uuid';
import db from '@src/db/models/index.js';
import { AppError } from '@src/errors/app.error.js';
import Errors from '@src/errors/errorCodes.js';
import { Logger } from '@src/utils/logger.js';

const TRANSACTION_CONSTANTS = {
  STATUSES: ['commit', 'rollback']
};

const CONTEXT_CONSTANTS = {
  TRACE_ID_HEADER: 'x-trace-id'
};

/**
 * Context middleware with automated database transaction management
 * @param {boolean} [automaticTransaction=false] - Enable automatic transaction management
 * @param {object} [options={}] - Additional options
 * @param {string} [options.isolationLevel='READ_COMMITTED'] - Transaction isolation level
 * @returns {Function} Express middleware function
 */
export default function contextMiddleware (automaticTransaction = false, options = {}) {
  const {
    isolationLevel = 'READ_COMMITTED'
  } = options;

  return async (req, res, next) => {
    const startTime = Date.now();
    const traceId = req.headers[CONTEXT_CONSTANTS.TRACE_ID_HEADER] || uuid();

    // Create request-specific context logger
    const contextLogger = Logger.child({ traceId });

    // Set trace ID in response headers for traceability
    res.setHeader(CONTEXT_CONSTANTS.TRACE_ID_HEADER, traceId);

    // Extract country and locale from request headers
    const country = req.headers['x-country-code'] || 'unknown';
    const locale = req.headers['accept-language'] ? req.headers['accept-language'].split(',')[0] : 'en-US';

    const context = {
      req,
      reqTimeStamp: startTime,
      traceId,
      models: db,
      location: country,
      locale,
      ip: req.clientIp || req.ip || req.socket.remoteAddress,
      logger: contextLogger,
      transactionMetadata: {
        enabled: automaticTransaction,
        startTime: null,
        endTime: null,
        status: null,
        isolationLevel,
        forceRollback: false
      }
    };

    if (automaticTransaction) {
      try {
        context.transactionMetadata.startTime = Date.now();

        // Start sequelize transaction and map to context.transaction
        context.transaction = await db.sequelize.transaction({
          isolationLevel: db.Sequelize.Transaction.ISOLATION_LEVELS[isolationLevel]
        });

        context.logger.debug('Database transaction started', {
          transactionId: context.transaction.id,
          isolationLevel
        });

        // Handler to decide to commit or rollback when request lifecycle ends
        const handleTransactionCompletion = async () => {
          if (!context.transaction ||
            context.transaction.finished ||
            TRANSACTION_CONSTANTS.STATUSES.includes(context.transaction.finished)) {
            return;
          }

          try {
            // Commit only on 2xx: anything else (4xx/5xx errors, 3xx
            // redirects) means the request did not succeed — roll back.
            const shouldRollback =
              res.statusCode.toString()[0] !== '2' ||
              context.transactionMetadata.forceRollback;

            if (shouldRollback) {
              await rollbackTransaction(context, res.statusCode);
            } else {
              await commitTransaction(context);
            }
          } catch (error) {
            context.logger.error('Transaction completion failed', { error: error.message });
            await rollbackTransaction(context, 500, error);
          }
        };

        // Finalize the transaction BEFORE the response body is written, so
        // the client never sees a success for data that failed to commit.
        // Every response path (sendResponse + error middleware) funnels
        // through res.json, so this is the single interception point. The
        // finish/close hooks below stay as a safety net for responses sent
        // without res.json (e.g. aborted connections).
        let finalization = null;
        const finalizeOnce = () => {
          finalization = finalization || Promise.resolve(handleTransactionCompletion());
          return finalization;
        };

        const originalJson = res.json.bind(res);
        res.json = function patchedJson (body) {
          finalizeOnce()
            .then(() => {
              // The controller built a success body but the transaction
              // rolled back (commit failure / forced rollback) — convert
              // to a 500 instead of acknowledging a write that didn't land.
              if (
                String(res.statusCode)[0] === '2' &&
                context.transactionMetadata.status === 'rolled_back'
              ) {
                res.statusCode = 500;
                body = {
                  success: false,
                  message: 'Transaction failed while saving — please retry',
                  errors: { code: 'TRANSACTION_FAILED', statusCode: 500 },
                  timestamp: new Date().toISOString(),
                  traceId
                };
              }
              originalJson(body);
            })
            .catch(() => {
              if (!res.headersSent) {
                res.status(500);
                originalJson({
                  success: false,
                  message: 'Transaction failed while saving — please retry',
                  errors: { code: 'TRANSACTION_FAILED', statusCode: 500 },
                  timestamp: new Date().toISOString(),
                  traceId
                });
              }
            });
          return res;
        };

        // Safety net: finalize if the connection ends without res.json.
        // finalizeOnce() is idempotent, so this never double-commits.
        // A `close` before `finish` means the client aborted mid-request —
        // the handler may have made partial writes, so force a rollback
        // rather than committing at the default 200 status code.
        let responseFinished = false;
        res.on('finish', () => {
          responseFinished = true;
          finalizeOnce();
        });
        res.on('close', () => {
          if (!responseFinished && !res.writableFinished) {
            context.transactionMetadata.forceRollback = true;
          }
          finalizeOnce();
        });
      } catch (error) {
        context.logger.error('Failed to start database transaction', { error: error.message });
        return next(AppError.internal('Failed to initialize database transaction', {
          operation: 'transaction_start',
          originalError: error.message
        }));
      }
    }

    // Context helper functions
    context.markTransactionForRollback = () => {
      if (context.transactionMetadata) {
        context.transactionMetadata.forceRollback = true;
      }
    };

    context.getTransactionStatus = () => {
      return {
        hasTransaction: !!context.transaction,
        status: context.transaction?.finished || 'active',
        metadata: context.transactionMetadata
      };
    };

    req.context = context;
    next();
  };
}

/**
 * Commits a database transaction
 */
async function commitTransaction (context) {
  try {
    await context.transaction.commit();
    context.transactionMetadata.status = 'committed';
    context.transactionMetadata.endTime = Date.now();

    const duration = context.transactionMetadata.endTime - context.transactionMetadata.startTime;
    context.logger.info('Database transaction committed successfully', {
      transactionId: context.transaction.id,
      durationMs: duration
    });
  } catch (error) {
    context.logger.error('Failed to commit transaction', { error: error.message });
    throw error;
  }
}

/**
 * Rolls back a database transaction
 */
async function rollbackTransaction (context, statusCode, error = null) {
  try {
    await context.transaction.rollback();
    context.transactionMetadata.status = 'rolled_back';
    context.transactionMetadata.endTime = Date.now();

    const duration = context.transactionMetadata.endTime - context.transactionMetadata.startTime;
    context.logger.warn('Database transaction rolled back', {
      transactionId: context.transaction.id,
      statusCode,
      durationMs: duration,
      reason: error ? error.message : 'Error response status code'
    });
  } catch (rollbackError) {
    context.logger.error('Failed to rollback transaction', { error: rollbackError.message });
    throw rollbackError;
  }
}
