const Task = require('./../../models/task');
const { transformTask } = require('./merge');


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
        { $push: { completedTasks: taskId } },
        { new: true }
      )
      
      return transformTask(taskUpdated);
    } catch (err) {
      throw err;
    }
  }
}