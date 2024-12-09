const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
    const { username, password } = request.body

    const user = await User.findOne({ username })
    const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
        return response.status(401).json({ // 401 Unauthorized (not authenticated)
            error: 'invalid username or password'
        })
    }

    const tokenUser = {
        username: user.username,
        id: user._id,
    } // needed for digitally signed token

    // token expires in 60*60 seconds, that is, in one hour
    const token = jwt.sign(
        tokenUser, 
        process.env.SECRET,
        { expiresIn: 60 }
    )

    response.status(200).send({ 
        token, // generated token
        username: user.username, 
        name: user.name 
    }) // browser saves token
})

module.exports = loginRouter