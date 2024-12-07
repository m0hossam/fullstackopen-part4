const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const _ = require('lodash')
const helper = require('./test_helper')
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app) // superagent object

describe('blog api tests', () => {
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
      'title': 'Trapped Underwater',
      'author': 'Jason Momoa',
      'url': 'http://celebtalk.com/jasonmomoa/trappedunderwater',
      'likes': 290,
    }
    await api.post('/api/blogs').send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    var blogs = await helper.blogsInDb()
    blogs = blogs.map(blog => {
      delete blog.id // remove id property for easier comparison
      return blog
    })
    assert.deepStrictEqual(blogs.find(b => _.isEqual(b, newBlog)), newBlog) // ensure newBlog is present
    assert.strictEqual(blogs.length, helper.initialBlogs.length + 1)
  })

  test('the likes property defaults to 0 if missing from the request', async () => {
    const newBlog = {
      'title': 'Memory Unfolded',
      'author': 'Jack Computron',
      'url': 'http://dgfop.com/mu1',
    }
    await api.post('/api/blogs').send(newBlog)

    const blogs = await helper.blogsInDb()
    assert.notDeepStrictEqual(blogs.find(b => {
      return b.title === newBlog.title &&
      b.author === newBlog.author &&
      b.url === newBlog.url &&
      b.likes === 0
    }), undefined)
  })

  test('backend responds with 400 if title or url are missing from request', async () => {
    const blogWithoutTitle = {
      'author': 'Edward Nigma',
      'url': 'http://eddygoth.org/rdlr/2018',
      'likes': 4
    }
    await api.post('/api/blogs').send(blogWithoutTitle).expect(400)

    const blogWithoutUrl = {
      'title': 'Cracking the Riddler\'s Puzzles',
      'author': 'Edward Nigma',
      'likes': 4
    }
    await api.post('/api/blogs').send(blogWithoutUrl).expect(400)

    const blogWithoutTitleOrUrl = {
      'url': 'http://eddygoth.org/rdlr/2018',
      'likes': 4
    }
    await api.post('/api/blogs').send(blogWithoutTitleOrUrl).expect(400)
  })

  test('the http delete request deletes a blog from db if found', async () => {
    var blogs = await helper.blogsInDb()
    const firstBlog = blogs[0]

    await api.delete(`/api/blogs/${firstBlog.id}`).expect(204)
    blogs = await helper.blogsInDb()
    assert.deepStrictEqual(blogs.find(b => b.id === firstBlog.id), undefined)

    await api.delete(`/api/blogs/${firstBlog.id}`).expect(404) // try to delete a non-existing blog
  })

  test('the http put request updates a blog in db if found', async () => {
    var blogs = await helper.blogsInDb()
    const firstBlog = blogs[0]
    firstBlog.likes = 99
    const updatedBlogObj = {
      title: firstBlog.title,
      author: firstBlog.author,
      url: firstBlog.url,
      likes: firstBlog.likes
    }

    const response = await api.put(`/api/blogs/${firstBlog.id}`).send(updatedBlogObj)
    assert.strictEqual(response.status, 200)
    assert.match(response.headers['content-type'], /application\/json/)
    assert.deepStrictEqual(response.body, firstBlog)

    blogs = await helper.blogsInDb()
    assert.deepStrictEqual(blogs.find(b => b.id === firstBlog.id), firstBlog)

    const nonExistingId = 'abcde1234567890123456789'
    await api.put(`/api/blogs/${nonExistingId}`).send(updatedBlogObj).expect(404)
  })
})

after(async () => {
  await mongoose.connection.close()
})