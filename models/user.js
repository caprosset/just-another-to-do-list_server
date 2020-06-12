const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  createdTasks: [ { type: Schema.Types.ObjectId, ref: 'Task' } ]
})

const User = mongoose.model('User', userSchema);
module.exports = User;