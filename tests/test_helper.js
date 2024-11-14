const Blog = require('../models/blog')

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

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

module.exports = {
    initialBlogs, blogsInDb
}