import { Router } from "express"
import productRouter from "./productRouter.js"
import catalogRouter from "./catalogRouter.js"
import userRouter from "./userRouter.js"
import cartRouter from "./cartRouter.js"
import subCatalogRouter from "./subCatalogRouter.js"
import orderRouter from "./orderRouter.js"
import selsRouter from "./selsRouter.js"
import { authMiddleware } from "../middleware/authMiddleware.js"

const router = Router()

router.use("/products", productRouter)
router.use("/catalog", catalogRouter)
router.use("/user", userRouter)
router.use("/cart", authMiddleware, cartRouter)
router.use("/sub-catalog", subCatalogRouter)
router.use("/order", authMiddleware, orderRouter)
router.use("/sale", selsRouter)

export default router