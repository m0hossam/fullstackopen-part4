const Blog = require('../models/blog')
const User = require('../models/user')

const rootUser = {
  username: 'admin',
  password: 'admin',
  name: 'Mohamed Hossam'
}

const initialBlogs = [
  {
    'title': 'Build Your Own DBMS in Go',
    'author': 'Steven Merchant',
    'url': 'https://build_your_own_x.com/dbms_go',
    'likes': 42
  },
  {
    'title': 'The Pragmatic Engineer',
    'author': 'Niccolo Pinocchio',
    'url': 'https://pinocchio.com/the_pragmatic_engineer',
    'likes': 1337
  },
  {
    'title': 'DBs Explained',
    'author': 'Andy Pavlo',
    'url': 'https://cmu.com/db_group/intro_to_dbs',
    'likes': 17
  },
  {
    'title': 'Tales of The Undertaker',
    'author': 'Mark Callaway',
    'url': 'https://wwe.com/the_undertaker_tales',
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