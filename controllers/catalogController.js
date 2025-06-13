import path, { dirname } from "path"
import { fileURLToPath } from "url"
import { Catalog, Product } from "../model/model.js"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

class CatalogController {
    async createCatalog(req, res) {
        const { name } = req.body

        try {
            if (!name) {
                return res.status(400).json({ message: "Некорректные данные" })
            }
            const catalog = await Catalog.create({ name })

            return res.status(200).json(catalog)
        } catch (err) {
            console.error
            return res.status(500).json({ message: "Ошибка сервера" })
        }
    }

    async getAllCatalog(req, res) {
        const catalog = await Catalog.findAll()
        return res.status(200).json({ catalog })
    }

    async getOneCatalog(req, res) {
        const { id } = req.params

        if (!id) {
            return res.status(404).json({ message: "Некорректные данные" })
        }

        const catalog = await Catalog.findByPk(id)

        if (!catalog) {
            return res.status(404).json({ message: "Каталог не найден" })
        }

        return res.status(200).json({ catalog })
    }

    async updateCatalog(req, res) {
        const { id } = req.params
        const { name } = req.body

        if (!id) {
            return res.status(404).json({ message: "Некорректные данные" })
        }

        if (!name) {
            return res.status(400).json({ message: "Некорректные данные" })
        }

        try {
            const catalog = await Catalog.findByPk(id)

            if (!catalog) {
                return res.status(404).json({ message: "Каталог не найден" })
            }

            await Catalog.update({ name }, { where: { id } })

            const catalogUpdate = await Catalog.findByPk(id)

            return res.status(200).json({ catalogUpdate, message: "Каталог обновлен" })
        } catch (err) {
            console.error(err)
        }
    }

    async deleteCatalog(req, res) {
        const { id } = req.params

        try {
            const catalog = await Catalog.findByPk(id, {
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
                where: { catalogId: id },
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

            await Product.destroy({ where: { catalogId: id } });

            await Catalog.destroy({ where: { id } })

            return res.status(200).json({ catalog, message: "Каталог удален" })
        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: "Ошибка сервера" })
        }
    }
}

export default new CatalogController()