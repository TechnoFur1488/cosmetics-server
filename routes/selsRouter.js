import { Router } from "express"
import selsController from "../controllers/selsController.js"

const router = Router()

router.get("/", selsController.getAllSels)

export default router