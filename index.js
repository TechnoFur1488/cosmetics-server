import express from "express"
import sequelize from "./db.js"
import "./model/model.js"
import fileUpload from "express-fileupload"
import router from "./routes/routes.js"
import { fileURLToPath } from "url"
import path, { dirname } from "path"
import cors from "cors"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = process.env.PORT

const app = express()

app.use(express.json())
app.use(express.static(path.resolve(__dirname, "static")))
app.use(fileUpload({}))

app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET", "PUT", "DELETE"]
}))

app.use("/api", router)


const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync({ alter: true })
        app.listen(PORT, () => console.log(`Сервер работает на порту ${PORT}`))
    } catch (e) {
        console.error(e)
    }
}

start()