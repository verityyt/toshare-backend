import express from "express";
const router = express.Router()

const jwt = require("jsonwebtoken")

router.post("/logout", (req, res) => {
    const cookies = req.cookies as Array<string>

    if (cookies["toshare"] != null) {
        const jwtCookie = cookies["toshare"]
        const id = req.body.id

        try {
            const decoded = jwt.verify(jwtCookie, process.env.JWT_SECRET)

            res.cookie("toshare", "", {
                httpOnly: true,
                secure: true,
                expires: new Date(0),
                domain: ".inceptioncloud.net"
            })

            res.send({ redirect: "https://inceptioncloud.net/toshare/login" })
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
        res.cookie("toshare", "", {
            httpOnly: true,
            secure: true,
            expires: new Date(0),
            domain: ".inceptioncloud.net"
        })
        res.send({ redirect: "https://inceptioncloud.net/toshare/login" })
    }
})