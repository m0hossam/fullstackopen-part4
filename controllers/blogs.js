const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (_request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  const savedBlog = await blog.save() // errors get caught and sent to the error-handler middleware thanks to express-async-errors
  response.status(201).json(savedBlog)
})

module.exports = blogsRouter