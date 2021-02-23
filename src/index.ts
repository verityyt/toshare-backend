import express from "express"

const app = express()
const port = 6060

app.get("/", (req, res) => {
    res.send({ status: "success" })
})

app.listen(port, () => {
    console.log(`spotify-mgk.rate app listening at http://localhost:${port}`)
})