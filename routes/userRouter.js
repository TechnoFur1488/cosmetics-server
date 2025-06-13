import { Router } from "express"
import userController from "../controllers/userController.js"
import { authMiddleware } from "../middleware/authMiddleware.js"

const router = Router()

router.post("/registration", userController.registration)
router.post("/login", userController.login)
router.put("/", authMiddleware, userController.updateUser)
router.get("/me", authMiddleware, userController.getUser)

export default router