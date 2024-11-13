const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)


const initialBlogs = [
  {
    "title": "The Bear Cookbook",
    "author": "Carmen Berzatto",
    "url": "http://carmythebear.com/cookbook",
    "likes": 42
  },
  {
    "title": "The Pragmatic Engineer",
    "author": "Niccolo Pinocchio",
    "url": "http://pinonico.com/thepragmaticengineer",
    "likes": 1337
  },
  {
    "title": "DBs Explained",
    "author": "Andy Pavlo",
    "url": "http://cmu.com/dbgroup",
    "likes": 17
  },
  {
    "title": "The Undertaker",
    "author": "Mark Callaway",
    "url": "http://wwe.com/theundertaker",
    "likes": 31,
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  for (const blog of initialBlogs) {
    const blogObj = new Blog(blog)
    await blogObj.save()
  }
})

test('blogs are returned as json', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, initialBlogs.length)  
  assert.match(response.headers['content-type'], /application\/json/)
  assert.strictEqual(response.status, 200)
})

after(async () => {
  await mongoose.connection.close()
})