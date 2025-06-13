import { Router } from "express"
import subCatalogController from "../controllers/subCatalogController.js"

const router = Router()

router.post("/", subCatalogController.createSubCatalog)
router.get("/:catalogId", subCatalogController.getAllSubCatalog)
router.put("/:id", subCatalogController.updateSubCatalog)
router.delete("/:id", subCatalogController.deleteSubCatalog)

export default router