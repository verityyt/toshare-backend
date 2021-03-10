import express from "express";
const router = express.Router()

const jwt = require("jsonwebtoken")

router.post("/read", (req, res) => {
    const cookies = req.cookies as Array<string>

    if (cookies["toshare"] != null) {

        if (req.body.todo != null) {
            const todo = req.body.todo as string
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