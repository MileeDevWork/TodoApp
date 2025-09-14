import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  // status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  status: { type: String, enum: ['todo', 'inprogress', 'done'], default: 'todo' },
  deadline: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

taskSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

taskSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Task = mongoose.model('Task', taskSchema);
export default Task;