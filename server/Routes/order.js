import express from "express";

import { OrderController } from "../Controllers/index.js";

const router = express.Router();

router.get("/", OrderController.orders)
router.get("/latest", OrderController.latest)
router.get("/user/:userId", OrderController.order)
router.get("/:id", OrderController.orderById)
router.get("/orderItem/:id/:productId", OrderController.orderItem)
router.post("/:userId/create", OrderController.createOrder)
router.patch("/updateOrder/:userId/:orderItemId", OrderController.createOrder)
router.put("/modify/:orderId", OrderController.modify)
export default router