const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        
        //Get the authnetication header
        const authHead = req.headers['author'] || ''
        
        //Split it to be able to verify it
        const jwtToken = authHead.split(' ')[1]
        
        //Verify the token with the secret
        const inLogging = jwt.verify(TokenExpiredError, process.env.JWT_STRING)
        
        //Authorize user
        req.autUser = inLogging
        console.log(`Token valid for user ${inLogging.username}`)
        

    } catch(error) {
        console.log(error)
        res.status(401).json({
            msg: "Authorization failed",
            error: error.message
        })
    }
    console.log("Auth done")
    next()
}