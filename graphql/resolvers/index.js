const bcrypt = require('bcryptjs');
const Task = require('./../../models/task');
const User = require('./../../models/user');


const getUser = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc, 
      createdTasks: getTasks.bind(this, user._doc.createdTasks),
      completedTasks: getTasks.bind(this, user._doc.completedTasks)
    }
  }
  catch (err) {
    throw err;
  }
}

const getTasks = async tasksIds => {
  try {
    const tasks = await Task.find({ _id: { $in: tasksIds }})
    return tasks.map(task => {
      return {
        ...task._doc, 
        deadline: new Date(task._doc.deadline).toISOString(), 
        creator: getUser.bind(this, task._doc.creator )
      }
    })
  } 
  catch (err) {
    throw err;
  }
}

module.exports = { 

  tasks: async () => {
    try {
      const tasks = await Task.find()
      // .populate('creator')
      return tasks.map(task => {
        return { 
          ...task._doc, 
          deadline: new Date(task._doc.deadline).toISOString(), 
          creator: getUser.bind(this, task._doc.creator) 
        };
      });
    } 
    catch(err) {
      throw err;
    }
  },

  users: async () => {
    try {
      const users = await User.find()
      return users.map(user => {
        return {
          ...user._doc,
          createdTasks: getTasks.bind(this, user._doc.createdTasks),
          completedTasks: getTasks.bind(this, user._doc.completedTasks),
        }
      })
    } catch (err) {
      throw err;
    }
  },

  createTask: async args => {
    const task = new Task({
      title: args.taskInput.title,
      description: args.taskInput.description,
      deadline: new Date(args.taskInput.deadline),
      taskCategory: args.taskInput.taskCategory,
      creator: "5ee3e8610ac82dd5e6c8e3a0" // mongoose converts this string in ObjectId format
    })
    let createdTask;

    try {
      const newTask = await task.save()
      createdTask = {
        ...newTask._doc, 
        deadline: new Date(newTask._doc.deadline).toISOString(), 
        creator: getUser.bind(this, newTask._doc.creator)
      };

      const userToUpdate = await User.findById("5ee3e8610ac82dd5e6c8e3a0")
      if(!userToUpdate){
        throw new Error('User not found')
      }
      userToUpdate.createdTasks.push(task);
      await userToUpdate.save(); // updates the user in the DB
    
      return createdTask;
    }
    catch (err) {
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
  },
}