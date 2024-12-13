const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (_request, response) => {
  const Users = await User.find({}).populate('blogs', { user : 0 }) // `user : 0` hides the user prop of the blog to avoid nesting
  response.json(Users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (password === undefined) {
    response.status(400).json({ error: 'Password is required' }).end()
  }

  if (password.length < 3) {
    response.status(400).json({ error: 'Password must be atleast 3 characters long' }).end()
  }

  const saltRounds = 10 // magic number
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })
  const savedUser = await user.save() // errors get caught and sent to the error-handler middleware thanks to express-async-errors
  response.status(201).json(savedUser)
})

usersRouter.delete('/:id', async (request, response) => {
  const deletedUser = await User.findByIdAndDelete(request.params.id)
  if (deletedUser) {
    response.status(204).end() // No content
  } else {
    response.status(404).end()
  }
})

module.exports = usersRouter