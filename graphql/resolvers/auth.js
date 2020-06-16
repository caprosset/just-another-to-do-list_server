const bcrypt = require('bcryptjs');
const User = require('./../../models/user');
const { getAllTasks } = require('./merge');


module.exports = { 
  users: async () => {
    try {
      const users = await User.find()
      return users.map(user => {
        return {
          ...user._doc,
          createdTasks: getAllTasks.bind(this, user._doc.createdTasks),
          completedTasks: getAllTasks.bind(this, user._doc.completedTasks),
        }
      })
    } catch (err) {
      throw err;
    }
  },

  createUser: async args => {
    try { 
      const existingUser = await User.findOne({email: args.userInput.email})
      if(existingUser) {
        throw new Error('User exists already');
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const newUser = new User({
        email: args.userInput.email,
        password: hashedPassword
      })
      const newUserSaved = await newUser.save()
      return {...newUserSaved._doc, password: null};
    }
    catch (err) { 
      throw err;
    }
  }
}