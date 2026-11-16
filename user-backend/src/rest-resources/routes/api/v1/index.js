// src/rest-resources/routes/api/v1/index.js
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import ordersRoutes from "./orders.routes.js";
import customersRoutes from "./customers.routes.js";
import demoRoutes from "./demo.routes.js";
import blogsRoutes from "./blogs.routes.js";
import categoriesRoutes from "./categories.routes.js";
import businessesRoutes from "./businesses.routes.js";
import publicRoutes from "./public.routes.js";
import uploadsRoutes from "./uploads.routes.js";
const router = Router();

// Register all v1 routes here.
router.use("/auth", authRoutes);
router.use("/orders", ordersRoutes);
router.use("/customers", customersRoutes);
router.use("/demo", demoRoutes);
router.use("/blogs", blogsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/businesses", businessesRoutes);
router.use("/uploads", uploadsRoutes);

// Public directory API — powers /browse and /b/[slug]; rate limited per route.
router.use("/public", publicRoutes);

export default router;
