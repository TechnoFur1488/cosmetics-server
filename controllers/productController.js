import { v4 as uuidv4 } from "uuid"
import { fileURLToPath } from "url"
import path, { dirname } from "path"
import { CartProduct, Product, ProductSale } from "../model/model.js"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

class ProductController {
    async createProduct(req, res) {
        const { name, brand, price, discount, catalogId, subCatalogId } = req.body
        const { img } = req.files || {}

        if (req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Нет доступа" })
        }

        try {
            if (!name || !brand || !price || !catalogId || !subCatalogId) {
                return res.status(400).json({ message: "Некорректные данные" })
            }

            if (!req.files) {
                return res.status(400).json({ message: "Файл не загружен" })
            }

            let fileName = uuidv4() + ".webp"
            img.mv(path.resolve(__dirname, "..", "static", fileName))

            const product = await Product.create({ name: name.trim(), brand: brand.trim(), price, discount, img: fileName, catalogId, subCatalogId })

            if (discount > 0) {
                await ProductSale.create({ productId: product.id })
            }

            return res.json(product)
        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: "Ошибка сервера" })
        }
    }

    async getAllProduct(req, res) {
        const { catalogId } = req.params
        const { subCatalogId } = req.query

        if (!catalogId) {
            return res.status(404).json({ message: "Некорректные данные" })
        }

        let product

        if (catalogId && !subCatalogId) {
            product = await Product.findAll({ where: { catalogId } })
        }
        if (catalogId && subCatalogId) {
            product = await Product.findAll({ where: { catalogId, subCatalogId } })
        }

        return res.status(200).json({ product })
    }

    async updateProduct(req, res) {
        const { id } = req.params
        const { name, brand, price, discount, catalogId, subCatalogId, existingImg } = req.body
        const { img } = req.files || {}

        if (req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Нет доступа" })
        }

        if (!id) {
            return res.status(404).json({ message: "Некорректные данные" })
        }

        if (!name || !brand || !price || !catalogId || !subCatalogId) {
            return res.status(400).json({ message: "Некорректные данные" })
        }

        try {
            let product = await Product.findByPk(id)

            if (!product) {
                return res.status(404).json({ message: "Продукт не найден" })
            }

            let imageUrl = existingImg || product.img

            if (img) {
                if (product.img && product.img !== existingImg) {
                    try {
                        const filePath = path.resolve(__dirname, "..", "static", product.img)
                        await fs.promises.unlink(filePath)
                    } catch (err) {
                        console.error(err)
                    }
                }

                const fileName = uuidv4() + ".webp"
                await img.mv(path.resolve(__dirname, "..", "static", fileName))
                imageUrl = fileName
            } else if (!existingImg && !product.img) {
                return res.status(400).json({ message: "Файл не загружен" })
            }

            const cartItem = await CartProduct.findAll({ where: { productId: id } })
            if (cartItem.length > 0) {
                await Promise.all(cartItem.map(async (item) => {
                    await CartProduct.update({ total: price * item.quantity, totalDiscount: discount * item.quantity }, { where: { id: item.id } })
                }))
            }

            await Product.update({ name: name.trim(), brand: brand.trim(), price, discount, img: imageUrl, catalogId, subCatalogId }, { where: { id } })

            if (discount > 0) {
                await ProductSale.create({ productId: product.id })
            }
            if (discount <= 0) {
                await ProductSale.destroy({ where: { productId: product.id } })
            }

            const updateProduct = await Product.findByPk(id)

            return res.status(200).json({ updateProduct, message: "Товар обновлен" })

        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: "Ошибка сервера" })
        }
    }

    async deleteProduct(req, res) {
        const { id } = req.params

        if (req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Нет доступа" })
        }

        if (!id) {
            return res.status(404).json({ message: "Некорректные данные" })
        }

        try {
            const product = await Product.findByPk(id)

            if (!product) {
                return res.status(404).json({ message: "Продукт не найден" })
            }

            if (product.img) {
                const filePath = path.resolve(__dirname, "..", "static", product.img)
                try {
                    await fs.promises.unlink(filePath)
                } catch (err) {
                    console.error(err)
                }
            }

            await CartProduct.destroy({ where: { productId: id } })

            await Product.destroy({ where: { id } })

            return res.status(200).json({ message: "Продукт удален" })
        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: "Ошибка сервера" })
        }


    }
}

export default new ProductController()