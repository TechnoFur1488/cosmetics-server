import { Product, ProductSale } from "../model/model.js"

class SelsController {
    async getAllSels(req, res) {
        const sels = await ProductSale.findAll()

        const productSale = sels.map(el => el.productId)

        const product = await Product.findAll({ where: { id: productSale } })

        return res.status(200).json({ product })
    }
}

export default new SelsController()