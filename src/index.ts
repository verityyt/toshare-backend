import express from "express"

const cors = require("cors")
const cookieParser = require("cookie-parser")
const app = express()
const port = 6060

app.use(cors({
    origin: ['https://inceptioncloud.net'],
    credentials: true
}))
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send({ status: "success", code: 200 })
})

app.get("/register", (req, res) => {
    console.log("Sending cookie...")

    let date = new Date()
    date.setDate(date.getDate() + 7)

    res.cookie("Obiwan", "Kenobi", {
        httpOnly: true,
        secure: true,
        expires: date
    })
    res.redirect("https://inceptioncloud.net/toshare/register/?test=true")
})

app.post("/callback", (req, res) => {
    const cookies = req.cookies as Array<string>
    console.log(cookies["Obiwan"])
    res.send({ status: "success" })
})

app.listen(port, () => {
    console.log(`spotify-mgk.rate app listening at https://toshare.inceptioncloud.net`)
})