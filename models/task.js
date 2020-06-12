const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: new Date() },
  creator: { type: Schema.Types.ObjectId, ref: 'User' }
})

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;