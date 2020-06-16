const bcrypt = require('bcryptjs');
const Task = require('./../../models/task');
const User = require('./../../models/user');


const getUser = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc, 
      createdTasks: getAllTasks.bind(this, user._doc.createdTasks),
      completedTasks: getAllTasks.bind(this, user._doc.completedTasks)
    }
  }
  catch (err) {
    throw err;
  }
}

const transformTask = task => {
  return {
    ...task._doc, 
    deadline: new Date(task._doc.deadline).toISOString(), 
    creator: getUser.bind(this, task._doc.creator) 
  }; 
}

const getAllTasks = async tasksIds => {
  try {
    const tasks = await Task.find({ _id: { $in: tasksIds }})
    return tasks.map(task => {
      return transformTask(task);
    })
  } 
  catch (err) {
    throw err;
  }
}

const getSingleTask = async taskId => {
  try {
    const task = await Task.findById(taskId)
    return transformTask(task);
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
        return transformTask(task);
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
          createdTasks: getAllTasks.bind(this, user._doc.createdTasks),
          completedTasks: getAllTasks.bind(this, user._doc.completedTasks),
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
      creator: "5ee8955c9ab24f43de260053" // mongoose converts this string in ObjectId format
    })
    let createdTask;

    try {
      const newTask = await task.save()
      createdTask = transformTask(newTask);
     
      const userToUpdate = await User.findById("5ee8955c9ab24f43de260053")
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

  changeTaskStatus: async args => {
    try {
      const { taskId } = args;
      let taskStatus;
      const taskToUpdate = await Task.findById(taskId);
      if(!taskToUpdate) {
        throw new Error(`This task doesn't exist`);
      } else {
        taskStatus = taskToUpdate.completed;
      }
      console.log('taskStatus to change :>> ', taskStatus);

      const taskUpdated = await Task.findByIdAndUpdate(
        taskId, 
        { completed: !taskStatus },
        { new: true }
      )

      await User.updateOne(
        { _id: taskToUpdate.creator },
        { $pull: { createdTasks: taskId }, $push: { completedTasks: taskId } },
        { new: true }
      )
      
      return transformTask(taskUpdated);
    } catch (err) {
      throw err;
    }
  }
}