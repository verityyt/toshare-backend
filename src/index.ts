import express from "express"

require('dotenv/config')

const cors = require("cors")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const mongoose = require("mongoose")

const app = express()
const port = 6060

/*--- MongoDB ---*/

mongoose.connect(`${process.env.DB_STRING}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const database = mongoose.connection
let accountsCollection = database.collection("accounts")
let todosCollection = database.collection("todos")
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

/*--- Cors & Cookies ---*/

app.use(cors({
    origin: ['https://inceptioncloud.net'],
    credentials: true
}))
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send({ status: "success", code: 200 })
})

/*--- Routes ---*/

app.post("/register", (req, res) => {
    if (req.header("username") != null && req.header("password") != null) {
        const username = req.header("username") as string
        const password = req.header("password") as string

        const pwHash = crypto.createHash("sha1").update(password).digest("hex")

        accountsCollection.findOne({
            username: username
        }).then((doc) => {
            if (doc == null) {
                const account = new AccountModel({
                    username: username,
                    password: pwHash
                })

                account.save(function (err, doc) {
                    if (err) return console.error(err)

                    let date = new Date()
                    date.setDate(date.getDate() + 7)

                    const id = doc._id

                    let token = jwt.sign({
                        id: id
                    }, process.env.JWT_SECRET)

                    res.cookie("toshare", token, {
                        httpOnly: true,
                        secure: true,
                        expires: date,
                        domain: ".inceptioncloud.net"
                    })

                    res.send({ redirect: "https://inceptioncloud.net/toshare/home" })
                })
            } else {
                res.send({ error: "Username not available!" })
            }
        })
    } else {
        res.send({ error: "An error occurred! Please try to refresh to page and try again." })
    }
})

app.post("/login", (req, res) => {
    if (req.header("username") != null && req.header("password") != null) {
        const username = req.header("username") as string
        const password = req.header("password") as string

        const pwHash = crypto.createHash("sha1").update(password).digest("hex")

        accountsCollection.findOne({
            username: username
        }).then((doc) => {
            if (doc != null) {

                const dbPwHash = doc.password

                if (dbPwHash == pwHash) {

                    const dbId = doc._id

                    let date = new Date()
                    date.setDate(date.getDate() + 7)

                    let token = jwt.sign({
                        id: dbId
                    }, process.env.JWT_SECRET)

                    res.cookie("toshare", token, {
                        httpOnly: true,
                        secure: true,
                        expires: date,
                        domain: ".inceptioncloud.net"
                    })

                    res.send({ redirect: "https://inceptioncloud.net/toshare/home" })

                } else {
                    res.send({ error: "Wrong username or password!" })
                }

            } else {
                res.send({ error: "Wrong username or password!" })
            }
        })
    } else {
        res.send({ error: "An error occurred! Please try to refresh to page and try again." })
    }
})

app.get("/read", async (req, res) => {
    const cookies = req.cookies as Array<string>

    if (cookies["toshare"] != null) {
        const jwtCookie = cookies["toshare"]

        try {
            const decoded = jwt.verify(jwtCookie, process.env.JWT_SECRET)
            const id = decoded.id

            const todos: Array<Object> = []

            await TodoModel.find({
                userId: id
            }, function (error, result) {
                result.map(doc => {
                    todos.push(doc)
                })
            })

            res.send(todos)
        } catch (e) {
            res.send({ redirect: "https://inceptioncloud.net/toshare/login" })
        }
    } else {
        res.send({ redirect: "https://inceptioncloud.net/toshare/login" })
    }
})

app.get("/done", async (req, res) => {
    const cookies = req.cookies as Array<string>

    if (cookies["toshare"] != null) {
        if (req.header("id") != null && req.header("todo") != null) {
            const jwtCookie = cookies["toshare"]
            const id = req.header("id")

            try {
                const decoded = jwt.verify(jwtCookie, process.env.JWT_SECRET)

                await TodoModel.findOneAndUpdate({
                    _id: id
                }, {
                    status: "done"
                }, {
                    upsert: false
                })

                res.send({ "success": true })
            } catch (e) {
                console.log(e)
                res.send({ redirect: "https://inceptioncloud.net/toshare/login" })
            }
        } else {
            res.send({ error: "An error occurred! Please try again later." })
        }
    } else {
        res.send({ redirect: "https://inceptioncloud.net/toshare/login" })
    }
})

app.get("/add", (req, res) => {
    const cookies = req.cookies as Array<string>

    if (cookies["toshare"] != null) {

        if (req.header("todo") != null) {
            const todo = req.header("todo") as string
            const jwtCookie = cookies["toshare"]

            try {
                const decoded = jwt.verify(jwtCookie, process.env.JWT_SECRET)
                const id = decoded.id

                const todoEntry = new TodoModel({
                    userId: id,
                    todo: todo,
                    status: "open"
                })

                todoEntry.save(function (err, doc) {
                    if (err) return console.error(err)
                })

                res.send({ test: true })
            } catch (e) {
                res.send({ redirect: "https://inceptioncloud.net/toshare/login" })
            }
        } else {
            res.send({ error: "An error occurred! Please try again later." })
        }


    } else {
        res.send({ redirect: "https://inceptioncloud.net/toshare/login" })
    }
})

app.listen(port, () => {
    console.log(`\ntoshare-backend app listening at https://toshare.inceptioncloud.net`)
})