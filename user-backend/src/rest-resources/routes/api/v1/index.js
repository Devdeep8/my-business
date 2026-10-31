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
import config from "@configs/app.config.js";
const router = Router();

// Register all v1 routes here.
router.use("/auth", authRoutes);
router.use("/orders", ordersRoutes);
router.use("/customers", customersRoutes);
router.use("/demo", demoRoutes);
router.use("/blogs", blogsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/businesses", businessesRoutes);

// Public directory API for external apps — never mounted in production.
if (config.get("env") !== "production") {
  router.use("/public", publicRoutes);
}

export default router;
