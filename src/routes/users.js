const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()


router.post('/', async (req, res) => {
    //Registering
    console.log("Request body:"+ req.body)

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

router.get('/', async(req,res) =>{
    res.json({msg: "oikee paikka"})
})

router.post('/login', async (req, res) => {
    //Logging in
    console.log("Request body: " + req.body)

    //Check if the username exists in db
    const existingUser = await prisma.users.findFirst({
        where: { username: req.body.username}
    })

    //check if its null
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
    const jwtAccess = await jwt.sign({
        sub: existingUser.id,
        name: existingUser.username
        
    }, process.env.JWT_STRING, {expiresIn: '15min'})

    const jwtRefresh = await jwt.sign({
        sub: existingUser.id,
        name: existingUser.username,
        lobby: 1
    }, process.env.JWT_STRING, {expiresIn: '30d'})

    await prisma.refresh_tokens.create({
        data:{
            user_id: existingUser.id,
            token: jwtRefresh,
            issued_at: new Date(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    })

    //Send needed information to user about success
    res.send({
        msg: "Login succeeded",
        id: existingUser.id,
        jwtAccess: jwtAccess,
        jwtRef: jwtRefresh
    })

})
module.exports = router