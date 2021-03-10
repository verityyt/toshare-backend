const mongoose = require("mongoose")

const database = mongoose.connection

const accountsCollection = database.collection("accounts")
const todosCollection = database.collection("todos")
database.on("error", console.error.bind(console, "connection error:"))

const AccountSchema = mongoose.Schema({
    username: String,
    password: String
})

const TodoSchema = mongoose.Schema({
    userId: String,
    todo: String,
    status: String
})

const AccountModel = mongoose.model("account", AccountSchema, "accounts")
const TodoModel = mongoose.model("todos", TodoSchema, "todos")

function connectDatabase() {
    mongoose.connect(`${process.env.DB_STRING}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
}