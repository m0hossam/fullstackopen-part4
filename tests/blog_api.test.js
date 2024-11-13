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
  for (let blog of initialBlogs) {
    let blogObj = new Blog(blog)
    await blogObj.save() // executes sequentially, next iteration awaits for current to finish
  }
})

test('correct amount of blogs are returned as json', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, initialBlogs.length)  
  assert.match(response.headers['content-type'], /application\/json/)
  assert.strictEqual(response.status, 200)
})

test.only('the unique identifier property of the blogs is named id', async () => {
  const response = await api.get('/api/blogs')
  const blogs = response.body
  blogs.forEach(blog => {
    const props = Object.keys(blog)
    assert.notStrictEqual(props.find(p => p === 'id'), undefined)
    assert.strictEqual(props.find(p => p === '_id'), undefined)
  })
})

after(async () => {
  await mongoose.connection.close()
})