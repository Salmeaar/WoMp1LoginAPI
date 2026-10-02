const express = require('express')
const app= express()

require('dotenv').config()
const PORT = process.env.PORT || 8080
const auth = require("./middleware/authorize")
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

console.log(`Node.js ${process.version}`)
app.use(auth)

app.post('/login', async (req, res) => {
    //Logging in
    res.send("Login page")

    const existingUser = yes// TODO:finish with prisma db

    //Check if the username exists in db
    if(existingUser === null){
        console.log(`User not found`)
        return res.status(401).send({msg: "Authentication Failed"})
    }

    //check the password of found username
    const check = await bcrypt.compare(req.body.password, existingUser.password)

    if(!check){
        console.log(`Password did not match`)
        return res.status(401).send({msg: "Authentication failed"})
    }


    //create a jwt token for authorization
    const jwtToken = await jwt.sign({
        sub: existingUser.id,
        name: existingUser.username
    }, process.env.JWT_STRING, {expiresIn: '7d'})

    //Send needed information to user about success
    res.send({
        msg: "Login succeeded",
        id: existingUser.id,
        jwt: jwtToken
    })

})

app.post('/', async (req, res) => {
    //Registering

    const hashedPw = await bcrypt.hash(req.body.password, 10)

    const newUser = await prisma.users.create({
        data: {
            username: req.body.username,
            password: hashedPw
        }
    })

    res.send({
        msg: "User created",
        id: newUser.id
    })
})

app.listen(PORT, () =>{
    console.log(`Server listening on http://localhost:${PORT}`)
})