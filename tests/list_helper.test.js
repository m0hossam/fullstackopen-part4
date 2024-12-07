const { describe, test } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

const blogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
]

describe('list helper tests', () => {

  describe('totalLikes tests:', () => {
    test('list is empty', () => {
      const emptyList = []
      const result = listHelper.totalLikes(emptyList)
      assert.strictEqual(result, 0)
    })

    test('list has one blog', () => {
      const oneBlogList = blogs.slice(0, 1)
      const result = listHelper.totalLikes(oneBlogList)
      assert.strictEqual(result, oneBlogList[0].likes)
    })

    test('list has one blog whose likes equal 0', () => {
      const oneBlogZeroLikesList = blogs.slice(4, 5)
      const result = listHelper.totalLikes(oneBlogZeroLikesList)
      assert.strictEqual(result, 0)
    })

    test('list has more than one blog', () => {
      const result = listHelper.totalLikes(blogs)
      var expected  = 0
      blogs.forEach((blog) => { // not using array.reduce() because the tested function is using it
        expected += blog.likes
      })
      assert.strictEqual(result, expected)
    })
  })

  describe('favoriteBlog tests:', () => { // compare likes instead of actual objects
    test('list is empty', () => {
      const emptyList = []
      const result = listHelper.favoriteBlog(emptyList)
      assert.deepStrictEqual(result, null)
    })

    test('list has one blog', () => {
      const oneBlogList = blogs.slice(0, 1)
      const result = listHelper.favoriteBlog(oneBlogList)
      assert.strictEqual(result.likes, oneBlogList[0].likes)
    })

    test('list has one blog whose likes equal 0', () => {
      const oneBlogZeroLikesList = blogs.slice(4, 5)
      const result = listHelper.favoriteBlog(oneBlogZeroLikesList)
      assert.strictEqual(result.likes, oneBlogZeroLikesList[0].likes)
    })

    test('list has more than one blog', () => {
      const result = listHelper.favoriteBlog(blogs)
      var mostLikes = 0
      blogs.forEach((blog) => { // not using array.reduce() because the tested function is using it
        mostLikes = blog.likes > mostLikes ? blog.likes : mostLikes
      })
      assert.strictEqual(result.likes, mostLikes) // do not compare blogs, there might be multiple with the same no. of likes
    })
  })

  describe('mostBlogs tests:', () => { // compare likes instead of actual objects
    test('list is empty', () => {
      const emptyList = []
      const result = listHelper.mostBlogs(emptyList)
      assert.deepStrictEqual(result, null)
    })

    test('list has one blog', () => {
      const oneBlogList = blogs.slice(0, 1)
      const result = listHelper.mostBlogs(oneBlogList)
      const expected = {
        author: oneBlogList[0].author,
        blogs: 1
      }
      assert.deepStrictEqual(result, expected)
    })

    test('list has more than one blog', () => {
      const result = listHelper.mostBlogs(blogs)
      const expected = {
        author: 'Robert C. Martin',
        blogs: 3
      }
      assert.deepStrictEqual(result, expected)
    })
  })

  describe('mostLikes tests:', () => { // compare likes instead of actual objects
    test('list is empty', () => {
      const emptyList = []
      const result = listHelper.mostLikes(emptyList)
      assert.deepStrictEqual(result, null)
    })

    test('list has one blog', () => {
      const oneBlogList = blogs.slice(0, 1)
      const result = listHelper.mostLikes(oneBlogList)
      const expected = {
        author: oneBlogList[0].author,
        likes: oneBlogList[0].likes
      }
      assert.deepStrictEqual(result, expected)
    })

    test('list has more than one blog', () => {
      const result = listHelper.mostLikes(blogs)
      const expected = {
        author: 'Edsger W. Dijkstra',
        likes: 17
      }
      assert.deepStrictEqual(result, expected)
    })
  })

})