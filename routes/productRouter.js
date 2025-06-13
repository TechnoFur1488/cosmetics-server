import { Router } from "express"
import productController from "../controllers/productController.js"
import { authMiddleware } from "../middleware/authMiddleware.js"

const router = Router()

router.post("/", authMiddleware, productController.createProduct)
router.get("/:catalogId", productController.getAllProduct)
router.put("/:id", authMiddleware, productController.updateProduct)
router.delete("/:id", authMiddleware, productController.deleteProduct)

export default router