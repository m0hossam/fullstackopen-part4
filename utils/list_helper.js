const listHelper = {
  totalLikes: (blogs) => {
    return blogs.reduce((sum, blog) => {
      return sum + blog.likes
    }, 0)
  },
  favoriteBlog: (blogs) => {
    const favBlog = blogs.reduce((favBlog, blog) => {
      return favBlog === null ? blog : blog.likes > favBlog.likes ? blog : favBlog
    }, null)
    return favBlog === null ? null : {
      title: favBlog.title,
      author: favBlog.author,
      likes: favBlog.likes
    }
  },
  mostBlogs: (blogs) => {
    const authors = new Map()
    var mostAuthor = null

    blogs.forEach(blog => {
      if (authors.get(blog.author) === undefined) {
        authors.set(blog.author, 0)
      }
      authors.set(blog.author, authors.get(blog.author) + 1)

      if (mostAuthor === null) {
        mostAuthor = blog.author
      } else {
        mostAuthor = authors.get(blog.author) > authors.get(mostAuthor) ? blog.author : mostAuthor
      }
    })

    return mostAuthor === null ? null :
      {
        author: mostAuthor,
        blogs: authors.get(mostAuthor)
      }
  },
  mostLikes: (blogs) => {
    const authors = new Map()
    var mostAuthor = null

    blogs.forEach(blog => {
      if (authors.get(blog.author) === undefined) {
        authors.set(blog.author, 0)
      }
      authors.set(blog.author, authors.get(blog.author) + blog.likes)

      if (mostAuthor === null) {
        mostAuthor = blog.author
      } else {
        mostAuthor = authors.get(blog.author) > authors.get(mostAuthor) ? blog.author : mostAuthor
      }
    })

    return mostAuthor === null ? null :
      {
        author: mostAuthor,
        likes: authors.get(mostAuthor)
      }
  }
}

module.exports = listHelper