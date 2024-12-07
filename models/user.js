const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minLength: [3, 'Username must be atleast 3 characters long'],
    required: [true, 'Username required'],
    unqiue: true // this fails if the DB already contains docs violating the constraint
  },
  name: {
    type: String,
    required: true
  },
  passwordHash: String
})

userSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

const createIndex = async () => { // async function to use await
  await User.collection.createIndex({ username: 1 }, { unique: true }) // ensure unique index is created
}

createIndex()

module.exports = User