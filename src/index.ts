import express from "express"
import { connectDatabase } from "./utils/database.js";

const cors = require("cors")

const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")

require("ejs")

const app = express()
const port = 6060

/*--- Database ---*/

connectDatabase()

/*--- Cors & Cookies ---*/

app.set("view engine", "ejs")
app.use(express.static("public"))

app.use(cors({
    origin: ['https://inceptioncloud.net'],
    credentials: true
}))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(bodyParser.raw());

/*--- Routes ---*/

app.get("/", (req, res) => {
    res.send({ status: "success", code: 200 })
})

const addRoute = require("./routes/add.js")
app.use("/add", addRoute)

const doneRoute = require("./routes/done.js")
app.use("/done", doneRoute)

const loginRoute = require("./routes/login.js")
app.use("/login", loginRoute)

const logoutRoute = require("./routes/logout.js")
app.use("/logout", logoutRoute)

const readRoute = require("./routes/read.js")
app.use("/read", readRoute)

const registerRoute = require("./routes/register.js")
app.use("/register", registerRoute)

const removeRoute = require("./routes/remove.js")
app.use("/remove", removeRoute)

const profileRoute = require("./routes/profile.js")
app.use("/profile", profileRoute)

app.listen(port, () => {
    console.log(`\ntoshare-backend app listening at https://toshare.inceptioncloud.net`)
})