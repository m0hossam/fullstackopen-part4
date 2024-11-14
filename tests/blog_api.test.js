const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const _ = require('lodash')
const helper = require('./test_helper')
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  for (let blog of helper.initialBlogs) {
    let blogObj = new Blog(blog)
    await blogObj.save() // executes sequentially, next iteration awaits for current to finish
  }
})

test('correct amount of blogs are returned as json', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, helper.initialBlogs.length)  
  assert.match(response.headers['content-type'], /application\/json/)
  assert.strictEqual(response.status, 200)
})

test('the unique identifier property of the blogs is named id', async () => {
  const blogs = await helper.blogsInDb()
  blogs.forEach(blog => {
    const props = Object.keys(blog)

    assert.notStrictEqual(props.find(p => p === 'id'), undefined)
    assert.strictEqual(props.find(p => p === '_id'), undefined)
  })
})

test('the http post request creates a new blog in the db', async () => {
  const newBlog = {
    "title": "Trapped Underwater",
    "author": "Jason Momoa",
    "url": "http://celebtalk/jasonmomoa/trappedunderwater",
    "likes": 290,
  }
  await api.post('/api/blogs').send(newBlog)
  .expect(201)
  .expect('Content-Type', /application\/json/)

  var blogs = await helper.blogsInDb()
  blogs = blogs.map(blog => {
    const { id, ...b } = blog // remove id property
    return b
  })
  assert.deepStrictEqual(blogs.find(b => _.isEqual(b, newBlog)), newBlog) // ensure newBlog is present
  assert.strictEqual(blogs.length, helper.initialBlogs.length + 1)
})

after(async () => {
  await mongoose.connection.close()
})