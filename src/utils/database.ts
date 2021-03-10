const mongoose = require("mongoose")

require('dotenv/config')

export const database = mongoose.connection

export const accountsCollection = database.collection("accounts")
export const todosCollection = database.collection("todos")
database.on("error", console.error.bind(console, "connection error:"))

export const AccountSchema = mongoose.Schema({
    username: String,
    password: String
})

export const TodoSchema = mongoose.Schema({
    userId: String,
    todo: String,
    status: String
})

export const AccountModel = mongoose.model("account", AccountSchema, "accounts")
export const TodoModel = mongoose.model("todos", TodoSchema, "todos")

export function connectDatabase() {
    mongoose.connect(`${process.env.DB_STRING}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
}