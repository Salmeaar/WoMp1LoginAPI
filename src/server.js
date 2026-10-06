const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 8080
require('dotenv').config()

console.log(`Node.js ${process.version}`)

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({ msg: "Struggling" })
})

const usersRouter = require('./routes/users')
app.use('/users', usersRouter)

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})