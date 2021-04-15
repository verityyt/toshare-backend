import express from "express";
import { TodoModel } from "../utils/database.js";
const router = express.Router()

const jwt = require("jsonwebtoken")

router.post("/", async (req, res) => {
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
            console.log(e)
            res.cookie("toshare", "", {
                httpOnly: true,
                secure: true,
                expires: new Date(0),
                domain: ".verity-network.de"
            })
            res.send({ redirect: "https://toshare.verity-network.de/login" })
        }
    } else {
        res.cookie("toshare", "", {
            httpOnly: true,
            secure: true,
            expires: new Date(0),
            domain: ".verity-network.de"
        })
        res.send({ redirect: "https://toshare.verity-network.de/login" })
    }
})

module.exports = router;