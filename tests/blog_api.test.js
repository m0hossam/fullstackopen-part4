const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const _ = require('lodash')
const helper = require('./test_helper')
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app) // superagent object

describe('blog api tests with one root user', () => {
  var jwtToken = null

  beforeEach(async () => {
    await User.deleteMany({})
    const user = new User({
      username: helper.rootUser.username,
      name: helper.rootUser.name,
      passwordHash: await bcrypt.hash(helper.rootUser.password, 10)
    })
    await user.save()

    await Blog.deleteMany({})
    for (let b of helper.initialBlogs) {
      let blog = new Blog(b)
      blog.user = user._id
      await blog.save() // executes sequentially, next iteration awaits for current to finish
      user.blogs = user.blogs.concat(blog)
    }
    await user.save()

    const tokenResponse = await api.post('/api/login').send({
      username: helper.rootUser.username,
      password: helper.rootUser.password
    })
    assert.strictEqual(tokenResponse.status, 200)
    assert.match(tokenResponse.headers['content-type'], /application\/json/)

    jwtToken = tokenResponse.body.token
    assert.notDeepStrictEqual(jwtToken, null)
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

    await api.post('/api/blogs')
      .set('Authorization', 'Bearer ' + jwtToken)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    var blogs = await helper.blogsInDb()
    blogs = blogs.map(blog => {
      delete blog.id // remove id property for easier comparison
      delete blog.user // remove user property for easier comparison
      return blog
    })
    assert.deepStrictEqual(blogs.find(b => _.isEqual(b, newBlog)), newBlog) // ensure newBlog is present ('_' is lodash utility lib)
    assert.strictEqual(blogs.length, helper.initialBlogs.length + 1)
  })

  test('the http post request fails with status 401 if a token is not provided', async () => {
    const newBlog = {
      'title': 'Trapped Underwater',
      'author': 'Jason Momoa',
      'url': 'http://celebtalk.com/jasonmomoa/trappedunderwater',
      'likes': 290,
    }

    await api.post('/api/blogs').send(newBlog).expect(401)

    const blogs = await helper.blogsInDb()
    assert.strictEqual(blogs.length, helper.initialBlogs.length)
  })

  test('the likes property defaults to 0 if missing from the request', async () => {
    const newBlog = {
      'title': 'Memory Unfolded',
      'author': 'Jack Computron',
      'url': 'http://dgfop.com/mu1',
    }
    await api.post('/api/blogs').set('Authorization', 'Bearer ' + jwtToken).send(newBlog)

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
    await api.post('/api/blogs').set('Authorization', 'Bearer ' + jwtToken).send(blogWithoutTitle).expect(400)

    const blogWithoutUrl = {
      'title': 'Cracking the Riddler\'s Puzzles',
      'author': 'Edward Nigma',
      'likes': 4
    }
    await api.post('/api/blogs').set('Authorization', 'Bearer ' + jwtToken).send(blogWithoutUrl).expect(400)

    const blogWithoutTitleOrUrl = {
      'url': 'http://eddygoth.org/rdlr/2018',
      'likes': 4
    }
    await api.post('/api/blogs').set('Authorization', 'Bearer ' + jwtToken).send(blogWithoutTitleOrUrl).expect(400)
  })

  test('the http delete request deletes a blog from db if found', async () => {
    var blogs = await helper.blogsInDb()
    const firstBlog = blogs[0]

    await api.delete(`/api/blogs/${firstBlog.id}`).set('Authorization', 'Bearer ' + jwtToken).expect(204)
    blogs = await helper.blogsInDb()
    assert.deepStrictEqual(blogs.find(b => b.id === firstBlog.id), undefined)

    await api.delete(`/api/blogs/${firstBlog.id}`).set('Authorization', 'Bearer ' + jwtToken).expect(404) // try to delete a non-existing blog
  })

  test('the http put request updates a blog in db if found', async () => {
    var blogs = await helper.blogsInDb()
    const firstBlog = blogs[0]
    firstBlog.likes = 99
    delete firstBlog.user // to make comparison easier
    const updatedBlogObj = {
      title: firstBlog.title,
      author: firstBlog.author,
      url: firstBlog.url,
      likes: firstBlog.likes
    }

    const response = await api.put(`/api/blogs/${firstBlog.id}`).send(updatedBlogObj)
    assert.strictEqual(response.status, 200)
    assert.match(response.headers['content-type'], /application\/json/)
    delete response.body.user // to make comparison easier
    assert.deepStrictEqual(response.body, firstBlog)

    blogs = await helper.blogsInDb()
    const updatedBlog = blogs.find(b => b.id === firstBlog.id)
    assert.notDeepStrictEqual(updatedBlog, null)
    delete updatedBlog.user // to make comparison easier
    assert.deepStrictEqual(updatedBlog, firstBlog)

    const nonExistingId = 'abcde1234567890123456789'
    await api.put(`/api/blogs/${nonExistingId}`).send(updatedBlogObj).expect(404)
  })
})

after(async () => {
  await mongoose.connection.close()
})