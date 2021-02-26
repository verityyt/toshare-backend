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

    const username = req.header("username") as string
    const password = req.header("password") as string

    const pwHash = crypto.createHash("sha1").update(password).digest("hex")

    collection.findOne({
        username: username
    }).then((doc) => {

        if(doc == null) {

            const account = new AccountModel({
                username: username,
                password: pwHash
            })

            account.save(function (err, doc) {
                if (err) return console.error(err)
                console.log(`Saved account with username ${username} in database!`)

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

        }else {

            res.send({ error: "Username not available!" })

        }

    })

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