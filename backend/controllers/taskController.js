import Task from '../models/Task.js';
import mongoose from 'mongoose';

// Get all tasks
export const getTasks = async (req, res) => {
  try {
    console.log('User from token:', req.user);
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { status, priority, deadline } = req.query;
    let query = { userId: new mongoose.Types.ObjectId(req.user.userId) };
    console.log('Query before filters (type check):', query, typeof query.userId);
    console.log('Database userId type check:', await Task.findOne({ userId: req.user.userId }, { userId: 1 }));

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (deadline) query.deadline = { $lte: new Date(deadline) };

    console.log('Final query:', query);
    const tasks = await Task.find(query).sort({ deadline: 1 });
    console.log('Tasks found:', tasks);
    res.json(tasks);
  } catch (error) {
    console.log('Error in getTasks:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get task by ID
export const getTaskById = async (req, res) => {
  try {
    console.log('User from token:', req.user);
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const task = await Task.findOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
      userId: new mongoose.Types.ObjectId(req.user.userId)
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create tasks
export const createTask = async (req, res) => {
  try {
    console.log('User from token:', req.user);
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { title, description, priority, status, deadline } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = new Task({
      title,
      description,
      priority,
      status,
      deadline: deadline ? new Date(deadline) : undefined,
      userId: new mongoose.Types.ObjectId(req.user.userId)
    });

    const savedTask = await task.save();
    console.log('Task created:', savedTask);
    res.status(201).json(savedTask);
  } catch (error) {
    console.log('Error in createTask:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// update tasks
export const updateTask = async (req, res) => {
  try {
    console.log('User from token:', req.user);
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { title, description, priority, status, deadline } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(req.params.id), userId: new mongoose.Types.ObjectId(req.user.userId) },
      { title, description, priority, status, deadline: deadline ? new Date(deadline) : undefined, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    console.log('Task updated:', task);
    res.json(task);
  } catch (error) {
    console.log('Error in updateTask:', error.message);
    res.status(500).json({ message: error.message });
  }
};

//delete tasks
export const deleteTask = async (req, res) => {
  try {
    console.log('User from token:', req.user);
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const task = await Task.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(req.params.id),
      userId: new mongoose.Types.ObjectId(req.user.userId)
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    console.log('Task deleted:', task);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.log('Error in deleteTask:', error.message);
    res.status(500).json({ message: error.message });
  }
};