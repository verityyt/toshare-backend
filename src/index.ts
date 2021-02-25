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
let collection = database.collection("accounts")
database.on("error", console.error.bind(console, "connection error:"))

const AccountSchema = mongoose.Schema({
    username: String,
    password: String
})

const AccountModel = mongoose.model("account", AccountSchema, "accounts")

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
    console.log("Called /register")

    const username = req.header("username") as string
    const password = req.header("password") as string

    const pwHash = crypto.createHash("sha1").update(password).digest("hex")

    saveAccount(username, pwHash)

    let date = new Date()
    date.setDate(date.getDate() + 7)

    let token = jwt.sign({
        id: getIdByUsername(username)
    }, process.env.JWT_SECRET)

    res.cookie("toshare", token, {
        httpOnly: true,
        secure: true,
        expires: date,
        domain: ".inceptioncloud.net"
    })
    res.send({ redirect: "https://inceptioncloud.net/toshare/home" })
})

app.get("/read", (req, res) => {
    const cookies = req.cookies as Array<string>
    const jwtCookie = cookies["toshare"]

    const decoded = jwt.verify(jwtCookie, process.env.JWT_SECRET)
    console.log("Decoded:")
    console.log(decoded)

    res.send({ test: true })
})

app.post("/callback", (req, res) => {
    const cookies = req.cookies as Array<string>
    console.log(cookies["Obiwan"])
    res.send({ status: "success" })
})

app.listen(port, () => {
    console.log(`toshare-backend app listening at https://toshare.inceptioncloud.net`)
})

/*--- Database functions ---*/

function saveAccount(username: string, password: string) {

    const account = new AccountModel({
        username: username,
        password: password
    })

    account.save(function (err, doc) {
        if (err) return console.error(err)
        console.log("Document saved!")
    })

}

function getIdByUsername(username: string): string {

    setTimeout(() => {
        collection.find().forEach((entry) => {
            if (entry.username == username) {
                console.log("Id is:")
                console.log(entry._id)
                return entry._id
            }
        })
    },500)

    return ""
}