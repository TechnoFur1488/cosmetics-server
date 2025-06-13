import { Router } from "express"
import catalogController from "../controllers/catalogController.js"

const router = Router()

router.post("/", catalogController.createCatalog)
router.get("/", catalogController.getAllCatalog)
router.get("/:id", catalogController.getOneCatalog)
router.put("/:id", catalogController.updateCatalog)
router.delete("/:id", catalogController.deleteCatalog)

export default router