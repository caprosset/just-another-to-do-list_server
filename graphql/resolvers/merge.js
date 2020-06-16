const User = require('./../../models/user');
const Task = require('./../../models/task');
const { dateToString } = require('./../../helpers/date');


const transformTask = task => {
  return {
    ...task._doc, 
    deadline: dateToString(task._doc.deadline), 
    creator: getUser.bind(this, task._doc.creator),
    createdAt: dateToString(task._doc.created_at),
    updatedAt: dateToString(task._doc.updated_at)
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

exports.transformTask = transformTask;
exports.getAllTasks = getAllTasks;
exports.getSingleTask = getSingleTask;
exports.getUser = getUser;