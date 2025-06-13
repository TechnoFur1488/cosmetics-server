import { CartProduct, Product, SubCatalog } from "../model/model.js"
import fs from "fs"
import path, { dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

class SubCatalogController {
    async createSubCatalog(req, res) {
        const { name, catalogId } = req.body

        try {
            if (!name || !catalogId) {
                return res.status(400).json({ message: "Некорректные данные" })
            }

            const subCatalog = await SubCatalog.create({ name, catalogId })

            return res.status(200).json(subCatalog)
        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: "Ошибка сервера" })
        }
    }

    async getAllSubCatalog(req, res) {
        const { catalogId } = req.params

        const catalog = await SubCatalog.findAll({ where: { catalogId } })
        return res.status(200).json({ catalog })
    }

    async updateSubCatalog(req, res) {
        const { id } = req.params
        const { name, catalogId } = req.body

        if (!id) {
            return res.status(404).json({ message: "Некорректные данные" })
        }

        if (!name || !catalogId) {
            return res.status(400).json({ message: "Некорректные данные" })
        }
        try {
            const catalog = await SubCatalog.findByPk(id)

            if (!catalog) {
                return res.status(404).json({ message: "Каталог не найден" })
            }

            await SubCatalog.update({ name, catalogId }, { where: { id } })

            const updateCatalog = await SubCatalog.findByPk(id)

            return res.status(200).json({ updateCatalog })

        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: "Ошибка сервера" })
        }
    }

    async deleteSubCatalog(req, res) {
        const { id } = req.params

        if (!id) {
            return res.status(404).json({ message: "Некорректные данные" })
        }

        try {
            const catalog = await SubCatalog.findByPk(id, {
                include: [{
                    model: Product,
                    as: "Products"
                }]
            })

            const allFile = [
                ...(catalog.Products?.flatMap(product => product.img) || [])
            ]

            await Promise.all(allFile.map(async (fileName) => {
                const filePath = path.resolve(__dirname, "..", "static", fileName)
                try {
                    await fs.promises.unlink(filePath)
                } catch (err) {
                    console.error(err)
                }
            }))

            const products = await Product.findAll({
                where: { subCatalogId: id },
                attributes: ['id']
            });
            const productIds = products.map(p => p.id);

            if (productIds.length > 0) {
                await CartProduct.destroy({
                    where: {
                        productId: productIds
                    }
                });
            }

            await Product.destroy({ where: { subCatalogId: id } });

            await SubCatalog.destroy({ where: { id } })

            return res.status(200).json({ catalog, message: "Каталог удален" })
        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: "Ошибка сервера" })
        }
    }
}

export default new SubCatalogController()