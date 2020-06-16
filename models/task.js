const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, default: new Date() },
  taskCategory: { type: String, enum: ['Important and urgent', 'Important but not urgent', 'Urgent but not important', 'Neither important nor urgent'] },
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  completed: { type: Boolean, default: false }
}, 
{
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
})

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;