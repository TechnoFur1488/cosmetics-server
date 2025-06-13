import { Router } from "express"
import orderController from "../controllers/orderController.js"

const router = Router()

router.post("/", orderController.createOrder)
router.get("/", orderController.getAllOrder)

export default router