const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (_request, response) => {
  const blogs = await Blog.find({}).populate('user', { blogs : 0 }) // `blogs : 0` hides the blogs prop of the user to avoid nesting
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  const decodedToken = jwt.verify(request.token, process.env.SECRET) // request.token is set in tokenExtractor middleware, raises JsonWebTokenError or TokenExpiredError if invalid
  if (!decodedToken.id) { // decodedToken should contain username and id fields
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)
  if (!user) {
    return response.status(404).json({ error: 'user not found' })
  }
  blog.user = user

  const savedBlog = await blog.save() // errors get caught and sent to the error-handler middleware thanks to express-async-errors
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET) // request.token is set in tokenExtractor middleware, raises JsonWebTokenError or TokenExpiredError if invalid
  if (!decodedToken.id) { // decodedToken should contain username and id fields
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)
  if (!user) {
    return response.status(404).json({ error: 'user not found' })
  }

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if (!blog.user) {
    return response.status(404).json({ error: 'no user associated with this blog' }) // should not be possible
  }

  if (blog.user.toString() !== user.id.toString()) {
    return response.status(403).json({ error: 'user did not create this blog' }) // forbidden
  }

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