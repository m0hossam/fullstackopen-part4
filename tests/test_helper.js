const Blog = require('../models/blog')
const User = require('../models/user')

const rootUser = {
  username: 'root',
  name: 'Mohamed Hossam',
  password: 'dummypsswrd'
}

const initialBlogs = [
  {
    'title': 'The Bear Cookbook',
    'author': 'Carmen Berzatto',
    'url': 'http://carmythebear.com/cookbook',
    'likes': 42
  },
  {
    'title': 'The Pragmatic Engineer',
    'author': 'Niccolo Pinocchio',
    'url': 'http://pinonico.com/thepragmaticengineer',
    'likes': 1337
  },
  {
    'title': 'DBs Explained',
    'author': 'Andy Pavlo',
    'url': 'http://cmu.com/dbgroup',
    'likes': 17
  },
  {
    'title': 'The Undertaker',
    'author': 'Mark Callaway',
    'url': 'http://wwe.com/theundertaker',
    'likes': 31,
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  rootUser, initialBlogs, blogsInDb, usersInDb
}