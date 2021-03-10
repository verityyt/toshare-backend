import express from "express";
const router = express.Router()

const jwt = require("jsonwebtoken")

router.post("/remove", async (req, res) => {
    const cookies = req.cookies as Array<string>

    if (cookies["toshare"] != null) {
        if (req.body.id != null) {
            const jwtCookie = cookies["toshare"]
            const id = req.body.id

            try {
                const decoded = jwt.verify(jwtCookie, process.env.JWT_SECRET)

                await TodoModel.deleteOne({
                    _id: id
                })

                res.send({ "success": true })
            } catch (e) {
                console.log(e)
                res.cookie("toshare", "", {
                    httpOnly: true,
                    secure: true,
                    expires: new Date(0),
                    domain: ".inceptioncloud.net"
                })
                res.send({ redirect: "https://inceptioncloud.net/toshare/login" })
            }
        } else {
            res.send({ error: "An error occurred! Please try again later." })
        }
    } else {
        res.cookie("toshare", "", {
            httpOnly: true,
            secure: true,
            expires: new Date(0),
            domain: ".inceptioncloud.net"
        })
        res.send({ redirect: "https://inceptioncloud.net/toshare/login" })
    }
})