import express from "express";
import { accountsCollection } from "../utils/database.js";
const router = express.Router()

const cryptojs = require("crypto")
const jwt = require("jsonwebtoken")

router.post("/", (req, res) => {

    if (req.body.username != null && req.body.password != null) {
        const username = req.body.username as string
        const password = req.body.password as string

        const pwHash = cryptojs.createHash("sha1").update(password).digest("hex")

        accountsCollection.findOne({
            username: username
        }).then((doc) => {
            if (doc != null) {

                const dbPwHash = doc.password

                if (dbPwHash == pwHash) {

                    const dbId = doc._id

                    let date = new Date()
                    date.setDate(date.getDate() + 7)

                    let token = jwt.sign({
                        id: dbId
                    }, process.env.JWT_SECRET)

                    res.cookie("toshare", token, {
                        httpOnly: true,
                        secure: true,
                        expires: date,
                        domain: ".verity-network.de"
                    })

                    res.send({ redirect: "https://toshare.verity-network.de/home" })

                } else {
                    res.send({ error: "Wrong username or password!" })
                }

            } else {
                res.send({ error: "Wrong username or password!" })
            }
        })
    } else {
        res.send({ error: "An error occurred! Please try to refresh to page and try again." })
    }
})

module.exports = router;