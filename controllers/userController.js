import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { Cart, User } from "../model/model.js"
import { v4 as uuidv4 } from "uuid"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)


const generateJwt = (id, phone, role) => {
    return jwt.sign({ id, phone, role }, process.env.SECRET_KEY, { expiresIn: "24h" })
}

class UserController {
    async registration(req, res) {
        const { name, phone, password } = req.body

        try {

            if (!phone || !password || !name) {
                return res.status(400).json({ message: "Не все поля заполнены" })
            }

            if (password.length < 8) {
                return res.status(400).json({ message: "Пароль должен содержать не менее 8 символов" })
            }

            const candidat = await User.findOne({ where: { phone } })

            if (candidat) {
                return res.status(400).json({ message: "Пользователь с таким phone уже существует" })
            }

            const hashPassword = await bcrypt.hash(password, 3)
            const user = await User.create({ name, phone, password: hashPassword, role: "USER" })
            const token = generateJwt(user.id, user.phone, user.role)

            

            return res.json({ token })
        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: "Ошибка сервера" })
        }
    }

    async login(req, res) {
        try {
            const { phone, password } = req.body
            const user = await User.findOne({ where: { phone } })

            if (!phone || !password) {
                return res.status(400).json({ message: "Телефон и пароль обязательны" });
            }

            if (!user) {
                return res.status(400).json({ message: "Пользователь не найден" })
            }

            let comparePassword = bcrypt.compareSync(password, user.password)

            if (!comparePassword) {
                return res.status(400).json({ message: "Неверный пароль" })
            }

            const token = generateJwt(user.id, user.phone, user.role)

            return res.json({ token })
        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: "Ошибка сервера" })
        }
    }

    async updateUser(req, res) {
        const userId = req.user.id
        const { name, gender, birthday, phone } = req.body
        const { img } = req.files || {}

        try {
            const user = await User.findByPk(userId)

            if (!user) {
                return res.status(404).json({ message: "Пользователь не найден" })
            }

            let fileName = user.img

            if (img) {
                if (user.img) {
                    const filePath = path.resolve(__dirname, "..", "static", user.img)
                    try {
                        await fs.promises.unlink(filePath)
                    } catch (err) {
                        console.error(err)
                    }
                }
                fileName = uuidv4() + ".webp"
                img.mv(path.resolve(__dirname, "..", "static", fileName))
            }

            await User.update({ img: fileName, name, gender, birthday, phone }, { where: { id: userId } })

            const userUpdate = await User.findByPk(userId, {
                attributes: { exclude: ["password"] }
            })

            return res.status(200).json(userUpdate)
        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: "Ошибка сервера" })
        }
    }

    async getUser(req, res) {
        const userId = req.user.id

        try {
            const user = await User.findByPk(userId, {
                attributes: { exclude: ["password"] }
            })

            if (!user) {
                return res.status(404).json({ message: "Пользователь не найден" })
            }

            return res.status(200).json(user)
        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: "Ошибка сервера" })
        }
    }
}

export default new UserController()