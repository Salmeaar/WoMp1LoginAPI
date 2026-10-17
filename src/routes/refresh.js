const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.post('/', async (req, res) => {
    const authHeader = req.get('jwtRef')
    const refreshToken = authHeader.split(" ")[1]

    if (!refreshToken) {
        return res.status(401).send({ msg: 'Refresh token required' })
    }

    let payload
    try {
        payload = jwt.verify(refreshToken, process.env.JWT_STRING)
    } catch {
        return res.status(401).send({ msg: 'Invalid or expired refresh token' })
    }

    const storedToken = await prisma.refresh_tokens.findFirst({
        where: { user_id: payload.sub, token: refreshToken }
    })

    if (!storedToken) {
        return res.status(401).send({ msg: 'Refresh token not recognized' })
    }

    const existingUser = await prisma.users.findUnique({
        where: { id: storedToken.user_id }
    })

    if (!existingUser) {
        return res.status(401).send({ msg: 'User not found' })
    }

    const newAccessToken = jwt.sign({
        sub: existingUser.id,
        name: existingUser.username
    }, process.env.JWT_STRING, { expiresIn: '15min' })

    res.send({
        msg: 'New access token delivered',
        id: existingUser.id,
        jwtAccess: newAccessToken,
        jwtRef: refreshToken
    })
})

router.delete('/', async (req, res) => {
    const authHeader = req.get('jwtRef')
    const refreshToken = authHeader.split(" ")[1]

    if (!refreshToken) {
        return res.status(401).send({ msg: 'Refresh token required' })
    }

    const result = await prisma.refresh_tokens.deleteMany({
        where: { token: refreshToken }
    })

    if (result.count === 0) {
        return res.status(404).send({ msg: 'Refresh token not found' })
    }

    res.send({
        msg: 'Token deleted'
    })
})

module.exports = router
