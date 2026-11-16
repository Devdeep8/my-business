// src/configs/app.config.js
import convict from 'convict';
import dotenv from 'dotenv';
import fs from 'fs';

// Only fill variables that are not already set in the shell, so local runs
// can override docker-specific hosts, e.g.
// DB_WRITE_HOST=127.0.0.1 REDIS_HOST=127.0.0.1 npm run dev
if (fs.existsSync('.env')) {
  const envConfig = dotenv.parse(fs.readFileSync('.env'));

  for (const key in envConfig) {
    if (process.env[key] === undefined) {
      process.env[key] = envConfig[key];
    }
  }
}

// `postgres`/`redis` are docker-network service names — they only resolve
// inside docker. When running on the host machine, map them to localhost so
// the app can connect to the dockerised services without env prefixes.
if (!fs.existsSync('/.dockerenv')) {
  for (const key of ['DB_WRITE_HOST', 'REDIS_HOST']) {
    if (process.env[key] === 'postgres' || process.env[key] === 'redis') {
      process.env[key] = '127.0.0.1';
    }
  }
}

// Accept Cloudinary's standard CLOUDINARY_URL as a convenience for local
// setup. Explicit per-field environment variables take precedence.
if (process.env.CLOUDINARY_URL) {
  try {
    const cloudinaryUrl = new URL(process.env.CLOUDINARY_URL);
    if (cloudinaryUrl.protocol !== 'cloudinary:') throw new Error('Invalid protocol');
    process.env.CLOUDINARY_CLOUD_NAME ||= cloudinaryUrl.hostname;
    process.env.CLOUDINARY_API_KEY ||= decodeURIComponent(cloudinaryUrl.username);
    process.env.CLOUDINARY_API_SECRET ||= decodeURIComponent(cloudinaryUrl.password);
  } catch {
    throw new Error('CLOUDINARY_URL must use cloudinary://<api-key>:<api-secret>@<cloud-name>');
  }
}

const config = convict({
  app: {
    name: {
      doc: 'Name of the service',
      format: String,
      default: 'crm-user-backend',
      env: 'APP_NAME'
    },
    url: {
      doc: 'URL of the service',
      format: String,
      default: 'user-backend:3000',
      env: 'APP_URL'
    },
    version: {
      doc: 'Version of the application',
      format: String,
      default: '1.0.0',
      env: 'APP_VERSION'
    },
    origin: {
      default: '',
      env: 'ALLOWED_ORIGIN'
    }
  },

  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'staging', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },

  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT'
  },

  db: {
    name: {
      doc: 'Database Name',
      format: String,
      default: 'api',
      env: 'DB_NAME'
    },
    username: {
      doc: 'Database user',
      format: String,
      default: 'postgres',
      env: 'DB_USERNAME'
    },
    password: {
      doc: 'Database password',
      format: '*',
      default: 'postgres',
      env: 'DB_PASSWORD'
    },
    host: {
      doc: 'DB host',
      format: String,
      default: '127.0.0.1',
      env: 'DB_WRITE_HOST'
    },
    port: {
      doc: 'DB PORT',
      format: 'port',
      default: '5432',
      env: 'DB_PORT'
    }
  },

  log_level: {
    doc: 'level of logs to show',
    format: String,
    default: 'debug',
    env: 'LOG_LEVEL'
  },

  jwt: {
    loginTokenSecret: {
      doc: 'JWT Secret Key',
      format: String,
      default: 'secretkey',
      env: 'JWT_LOGIN_SECRET'
    },
    loginTokenExpiry: {
      doc: 'JWT Access Token Expiry time',
      format: String,
      default: '15m',
      env: 'JWT_LOGIN_TOKEN_EXPIRY'
    },
    refreshTokenSecret: {
      doc: 'JWT Refresh Token Secret Key',
      format: String,
      default: 'refreshsecretkey',
      env: 'JWT_REFRESH_SECRET'
    },
    refreshTokenExpiry: {
      doc: 'JWT Refresh Token Expiry time',
      format: String,
      default: '7d',
      env: 'JWT_REFRESH_TOKEN_EXPIRY'
    },
    sessionTimeout: {
      doc: 'Session timeout in minutes for inactive users',
      format: Number,
      default: 30,
      env: 'JWT_SESSION_TIMEOUT'
    },
    maxSessions: {
      doc: 'Maximum concurrent sessions per user',
      format: Number,
      default: 5,
      env: 'JWT_MAX_SESSIONS'
    }
  },

  bcrypt: {
    hashingRounds: {
      doc: 'Bcrypt Hashing rounds',
      default: 10,
      format: Number,
      env: 'HASHING_ROUNDS'
    }
  },

  audit: {
    enabled: {
      doc: 'Master switch for audit event enqueueing',
      format: Boolean,
      default: true,
      env: 'AUDIT_LOG_ENABLED'
    },
    queueName: {
      doc: 'BullMQ queue name for audit log events',
      format: String,
      default: 'audit-logs',
      env: 'AUDIT_QUEUE_NAME'
    }
  },

  redis: {
    host: {
      doc: 'Redis host',
      format: String,
      default: '127.0.0.1',
      env: 'REDIS_HOST'
    },
    port: {
      doc: 'Redis port',
      format: 'port',
      default: 6379,
      env: 'REDIS_PORT'
    },
    password: {
      doc: 'Redis password',
      format: String,
      default: '',
      env: 'REDIS_PASSWORD'
    }
  },

  cloudinary: {
    cloudName: {
      doc: 'Cloudinary cloud name',
      format: String,
      default: '',
      env: 'CLOUDINARY_CLOUD_NAME'
    },
    apiKey: {
      doc: 'Cloudinary API key',
      format: String,
      default: '',
      env: 'CLOUDINARY_API_KEY'
    },
    apiSecret: {
      doc: 'Cloudinary API secret',
      format: String,
      default: '',
      env: 'CLOUDINARY_API_SECRET'
    }
  },

  webApp: {
    baseUrl: {
      default: '',
      env: 'WEB_APP_BASE_URL'
    },
    whitelist: {
      default: [],
      format: Array,
      env: 'WHITELIST'
    }
  }
});

config.validate({ allowed: 'strict' });

export default config;
