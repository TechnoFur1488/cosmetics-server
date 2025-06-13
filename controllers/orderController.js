import { Cart, CartProduct, Order, OrderItem } from "../model/model.js"

class OrderController {
    async createOrder(req, res) {
        const { city, delivery, adress, coment, phone, email, name, payment } = req.body
        const userId = req.user.id

        if (!userId) {
            return res.status(400).json({ message: "Пользователь не найден" })
        }

        try {

            if (delivery === "Курьер") {

                const cart = await Cart.findOne({ where: { userId } })

                const cartItem = await CartProduct.findAll({ where: { cartId: cart.id } })

                if (!cartItem || cartItem.length === 0) {
                    return res.status(404).json({ message: "Товары не найдены" })
                }

                const total = cartItem.reduce((sum, i) => sum + i.total, 0)

                const order = await Order.create({ city, delivery, adress, coment, phone, email, name, payment, total: total, userId })

                for (const item of cartItem) {
                    await OrderItem.create({ orderId: order.id, productId: item.productId, quantity: item.quantity, price: item.total, brand: item.brand, name: item.name })
                }

                await CartProduct.destroy({ where: { cartId: cart.id } })

                return res.status(200).json({ order, message: "Заказ создан" })

            } else if (delivery === "Самовывоз") {

                const cart = await Cart.findOne({ where: { userId } })

                const cartItem = await CartProduct.findAll({ where: { cartId: cart.id } })

                if (!cartItem || cartItem.length === 0) {
                    return res.status(404).json({ message: "Товары не найдены" })
                }

                const total = cartItem.reduce((sum, i) => sum + i.total, 0)

                const order = await Order.create({ city, delivery, phone, email, name, payment, total: total, userId })

                for (const item of cartItem) {
                    await OrderItem.create({ orderId: order.id, productId: item.productId, quantity: item.quantity, price: item.total, brand: item.brand, name: item.name })
                }

                await CartProduct.destroy({ where: { cartId: cart.id } })

                return res.status(200).json({ order, message: "Заказ создан" })
            }

        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: "Ошибка сервера" })
        }
    }

    async getAllOrder(req, res) {
        const order = await Order.findAll()

        return res.status(200).json({ order })
    }
}

export default new OrderController()