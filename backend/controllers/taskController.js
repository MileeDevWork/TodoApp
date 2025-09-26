import Task from '../models/Task.js';
import mongoose from 'mongoose';

/**
 * GET /api/tasks
 * Hỗ trợ lọc: status, priority, deadline (exact), startFrom/startTo, endFrom/endTo
 */
export const getTasks = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const {
      status,
      priority,
      deadline,        // optional: exact date/time
      startFrom,       // optional: ISO -> filter startAt >= startFrom
      startTo,         // optional: ISO -> filter startAt <= startTo
      endFrom,         // optional: ISO -> filter endAt   >= endFrom
      endTo,           // optional: ISO -> filter endAt   <= endTo
    } = req.query;

    const query = { userId: new mongoose.Types.ObjectId(req.user.userId) };
    if (status)   query.status   = status;
    if (priority) query.priority = priority;
    if (deadline) query.deadline = new Date(deadline);

    if (startFrom || startTo) {
      query.startAt = {};
      if (startFrom) query.startAt.$gte = new Date(startFrom);
      if (startTo)   query.startAt.$lte = new Date(startTo);
    }
    if (endFrom || endTo) {
      query.endAt = {};
      if (endFrom) query.endAt.$gte = new Date(endFrom);
      if (endTo)   query.endAt.$lte = new Date(endTo);
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.log('Error in getTasks:', error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/tasks/:id
 */
export const getTaskById = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const task = await Task.findOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
      userId: new mongoose.Types.ObjectId(req.user.userId),
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.log('Error in getTaskById:', error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/tasks
 * Body: { title, description?, priority?, status?, deadline?, startAt?, endAt? }
 */
export const createTask = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { title, description, priority, status, deadline, startAt, endAt } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Chuẩn hoá & validate thời gian
    const start = startAt ? new Date(startAt) : null;
    const end   = endAt   ? new Date(endAt)   : null;
    if (start && end && end < start) {
      return res.status(400).json({ message: 'endAt must be after startAt' });
    }

    const payload = {
      title,
      description,
      priority,
      status,
      deadline: deadline ? new Date(deadline) : undefined,
      startAt: start,
      endAt: end,
      userId: new mongoose.Types.ObjectId(req.user.userId),
    };

    const savedTask = await Task.create(payload);
    res.status(201).json(savedTask);
  } catch (error) {
    console.log('Error in createTask:', error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/tasks/:id
 * Body (partial): { title?, description?, priority?, status?, deadline?, startAt?, endAt? }
 */
export const updateTask = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { title, description, priority, status, deadline, startAt, endAt } = req.body;

    // Chỉ cập nhật trường được gửi
    const patch = {};
    if (title       !== undefined) patch.title       = title;
    if (description !== undefined) patch.description = description;
    if (priority    !== undefined) patch.priority    = priority;
    if (status      !== undefined) patch.status      = status;
    if (deadline    !== undefined) patch.deadline    = deadline ? new Date(deadline) : null;
    if (startAt     !== undefined) patch.startAt     = startAt  ? new Date(startAt)  : null;
    if (endAt       !== undefined) patch.endAt       = endAt    ? new Date(endAt)    : null;
    patch.updatedAt = Date.now();

    // Validate khoảng thời gian nếu có đủ cả hai
    if (patch.startAt && patch.endAt && patch.endAt < patch.startAt) {
      return res.status(400).json({ message: 'endAt must be after startAt' });
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(req.params.id),
        userId: new mongoose.Types.ObjectId(req.user.userId),
      },
      { $set: patch },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    res.json(task);
  } catch (error) {
    console.log('Error in updateTask:', error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const task = await Task.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(req.params.id),
      userId: new mongoose.Types.ObjectId(req.user.userId),
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.log('Error in deleteTask:', error.message);
    res.status(500).json({ message: error.message });
  }
};
