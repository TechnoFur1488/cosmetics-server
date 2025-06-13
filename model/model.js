import { DataTypes } from "sequelize"
import sequelize from "../db.js"

const User = sequelize.define("user", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    img: { type: DataTypes.STRING, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    gender: { type: DataTypes.STRING, allowNull: true },
    birthday: { type: DataTypes.DATEONLY, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true, unique: true },
    password: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.STRING, allowNull: true, defaultValue: "USER" },
})

const Cart = sequelize.define("cart", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: true }
})

const CartProduct = sequelize.define("cart-product", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    total: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    totalDiscount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    name: { type: DataTypes.STRING, allowNull: false },
    brand: { type: DataTypes.STRING, allowNull: false },
    img: { type: DataTypes.STRING, allowNull: false },
})

const Product = sequelize.define("product", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    img: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    brand: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    discount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
})

const ProductSale = sequelize.define("product-sale", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})

const Catalog = sequelize.define("catalog", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
})

const SubCatalog = sequelize.define("sub-catalog", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true }
})

const Order = sequelize.define("order", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    city: { type: DataTypes.STRING, allowNull: false },
    delivery: { type: DataTypes.STRING, allowNull: false },
    adress: { type: DataTypes.STRING, allowNull: true },
    comment: { type: DataTypes.TEXT, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    payment: { type: DataTypes.STRING, allowNull: false },
    total: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
})

const OrderItem = sequelize.define("order-item", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    price: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    brand: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
})

User.hasOne(Cart)
Cart.belongsTo(User)

Cart.hasMany(CartProduct)
CartProduct.belongsTo(Cart)

Product.hasOne(CartProduct)
CartProduct.belongsTo(Product)

Catalog.hasMany(Product, { onDelete: "CASCADE", as: "Products" })
Product.belongsTo(Catalog)

Catalog.hasOne(SubCatalog, { onDelete: "CASCADE" })
SubCatalog.belongsTo(Catalog)

SubCatalog.hasMany(Product, { onDelete: "CASCADE", as: "Products" })
Product.belongsTo(SubCatalog)

User.hasMany(Order)
Order.belongsTo(User)

Order.hasMany(OrderItem)
OrderItem.belongsTo(Order)

Product.hasMany(OrderItem)
OrderItem.belongsTo(Product)

Product.hasOne(ProductSale)
ProductSale.belongsTo(Product)

export {
    User,
    Cart,
    CartProduct,
    Product,
    Catalog,
    SubCatalog,
    Order,
    OrderItem,
    ProductSale
}