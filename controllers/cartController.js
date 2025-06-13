import { Cart, CartProduct, Product } from "../model/model.js"

class CartController {
    async addCart(req, res) {
        const { productId, quantity = 1 } = req.body
        const userId = req.user.id

        try {
            const product = await Product.findByPk(productId)

            if (!product) {
                return res.status(404).json({ message: "Продукт не найден" })
            }

            const totalPrice = quantity * product.price
            const totalDiscount = quantity * product.discount

            let cart = await Cart.findOne({ where: { userId } })

            if (!cart) {
                cart = await Cart.create({ userId })
            }

            const cartItem = await CartProduct.findOne({ where: { cartId: cart.id, productId } })

            if (cartItem) {
                return res.status(400).json({ message: "Товар уже добавлен в корзину" })
            }

            await CartProduct.create({ cartId: cart.id, productId, quantity, total: totalPrice, totalDiscount: totalDiscount, name: product.name, brand: product.brand, img: product.img })

            const cartProduct = await CartProduct.findOne({ where: { cartId: cart.id } })

            return res.status(200).json({ cartProduct, message: "Товар добавлен в корзину" })
        } catch (err) {
            console.error(err)
            return res.status(200).json({ message: "Ошибка сервера" })
        }
    }

    async getCart(req, res) {
        const userId = req.user.id

        let cart = await Cart.findOne({ where: { userId } })

        if (!cart) {
            cart = await Cart.create({ userId })
        }

        const cartItem = await CartProduct.findAll({ where: { cartId: cart.id }, order: [["createdAt", "DESC"]] })

        return res.status(200).json({ cartItem })
    }

    async updateCart(req, res) {
        const userId = req.user.id
        const { id, productId, quantity = 1 } = req.body

        if (!id) {
            return res.status(400).json({ message: "Некорректные данные" })
        }

        if (quantity < 1) {
            return res.status(400).json({ message: "Некорректные данные" })
        }

        try {
            const product = await Product.findOne({ where: { id: productId } })

            if (!product) {
                return res.status(404).json({ message: "Продукт не найден" })
            }

            const cart = await Cart.findOne({ where: { userId } })

            const totalPrice = product.price * quantity
            const totalDiscount = product.discount * quantity

            await CartProduct.update({ quantity, total: totalPrice, totalDiscount: totalDiscount }, { where: { cartId: cart.id, id } })

            const updateCartProduct = await CartProduct.findByPk(id)

            return res.status(200).json({ updateCartProduct, message: "Товар в корзине обновлен" })
        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: "Ошибка сервера" })
        }

    }

    async deleteCart(req, res) {
        const userId = req.user.id
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Некорректные данные" })
        }

        try {
            const cart = await Cart.findOne({ where: { userId } })

            const product = await CartProduct.findByPk(id)

            if (!product) {
                return res.status(404).json({ message: "Продукт не найден" })
            }

            await CartProduct.destroy({ where: { cartId: cart.id, id } })

            return res.status(200).json({ message: "Товар удален из корзины" })
        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: "Ошибка сервера" })
        }

    }
}

export default new CartController()