const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (_request, response) => {
  const blogs = await Blog.find({}).populate('user', { blogs: 0 }) // `blogs : 0` hides the blogs prop of the user to avoid nesting
  response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const blog = new Blog(request.body)

  const user = request.user // userExtractor middleware ensures request.user is not null
  blog.user = user

  const savedBlog = await blog.save() // errors get caught and sent to the error-handler middleware thanks to express-async-errors
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if (!blog.user) {
    return response.status(404).json({ error: 'no user associated with this blog' }) // should not be possible
  }

  if (blog.user.toString() !== request.user.id.toString()) { // userExtractor middleware ensures request.user is not null
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
  ).populate('user', { blogs: 0 })
  if (updatedBlog) {
    response.json(updatedBlog)
  } else {
    response.status(404).end()
  }
})

module.exports = blogsRouter