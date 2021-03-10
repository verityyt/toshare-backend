import express from "express"

require('dotenv/config')

const cors = require("cors")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")

const app = express()
const port = 6060

/*--- Database ---*/

connectDatabase()

/*--- Cors & Cookies ---*/

app.use(cors({
    origin: ['https://inceptioncloud.net'],
    credentials: true
}))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.get("/", (req, res) => {
    res.send({ status: "success", code: 200 })
})

/*--- Routes ---*/

const registerRoute = require("./routes/register.js")
app.use("/register", registerRoute)

/*--- Routes OLD ---*/

app.post("/login", (req, res) => {
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
                        domain: ".inceptioncloud.net"
                    })

                    res.send({ redirect: "https://inceptioncloud.net/toshare/home" })

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

app.post("/read", async (req, res) => {
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

app.post("/done", async (req, res) => {
    const cookies = req.cookies as Array<string>

    if (cookies["toshare"] != null) {
        if (req.body.id != null) {
            const jwtCookie = cookies["toshare"]
            const id = req.body.id

            try {
                const decoded = jwt.verify(jwtCookie, process.env.JWT_SECRET)

                await TodoModel.findOneAndUpdate({
                    _id: id
                }, {
                    status: "done"
                }, {
                    upsert: false
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

app.post("/add", (req, res) => {
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

app.post("/remove", async (req, res) => {
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

app.post("/logout", async (req, res) => {
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

app.listen(port, () => {
    console.log(`\ntoshare-backend app listening at https://toshare.inceptioncloud.net`)
})