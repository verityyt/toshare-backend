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

app.listen(port, () => {
    console.log(`spotify-mgk.rate app listening at https://toshare.inceptioncloud.net`)
})