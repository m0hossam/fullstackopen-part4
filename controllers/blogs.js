const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFromRequest = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) { // 'Bearer smthsmthtoken'
    return authorization.replace('Bearer ', '') // trim the scheme and return only the token
  }
  return null
}

blogsRouter.get('/', async (_request, response) => {
  const blogs = await Blog.find({}).populate('user', { blogs : 0 }) // `blogs : 0` hides the blogs prop of the user to avoid nesting
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  const decodedToken = jwt.verify(getTokenFromRequest(request), process.env.SECRET) // raises JsonWebTokenError or TokenExpiredError if invalid 
  if (!decodedToken.id) { // decodedToken should contain username and id fields
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)
  blog.user = user
  
  const savedBlog = await blog.save() // errors get caught and sent to the error-handler middleware thanks to express-async-errors 
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const deletedBlog = await Blog.findByIdAndDelete(request.params.id)
  if (deletedBlog) {
    response.status(204).end() // No content
  } else {
    response.status(404).end()
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const blog = { // IMPORTANT: this is a regular JS object, not a Mongoose model like in POST
    title: body.title,
    url: body.url,
    author: body.author,
    likes: body.likes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog,
    {
      new: true, // display updated document
      runValidators: true, // run update validators
      context: 'query' // use query context, not the global object
    }
  )
  if (updatedBlog) {
    response.json(updatedBlog)
  } else {
    response.status(404).end()
  }
})

module.exports = blogsRouter