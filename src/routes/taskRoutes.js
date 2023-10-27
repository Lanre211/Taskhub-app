const express = require('express');
const router = express.Router();
const Task = require('../models/Task'); // Import the Task model
const authMiddleware = require('../middleware/auth'); // Import authentication middleware if required


/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management
 */

/**
 * @swagger
 * /api/tasks/create:
 *   post:
 *     summary: Create a new task.
 *     description: Create a new task with a title, description, and deadline.
 *     tags: [Tasks]
 * security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the task.
 *               description:
 *                 type: string
 *  description: The description of the task.
 *               deadline:
 *                 type: string
 *                 format: date
 *                 description: The deadline of the task.
 *             required:
 *               - title
 *  - deadline
 *     responses:
 *       201:
 *         description: Task created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request. Title or deadline missing.
 *       401:
 *         description: Unauthorized. User not authenticated.
 *       500:
 *         description: Internal server error.
 */

// Route for creating a new task
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const userId = req.user._id; // Assuming you have user authentication

    const task = new Task({
      title,
      description,
      deadline,
      user: userId,
    });

    const savedTask = await task.save();

    res.json(savedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create the task.' });
  }
});


/**
 * @swagger
 * /api/tasks/all:
 *   get:
 *     summary: Retrieve all tasks.
 *     description: Retrieve all tasks created by the authenticated user.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved tasks.
 *         content:
 *           application/json:
 *             schema:
 *  *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized. User not authenticated.
 *       500:
 *         description: Internal server error.
 */

// Route for retrieving all tasks
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you have user authentication

    const tasks = await Task.find({ user: userId });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
});

/**
 * @swagger
 * /api/tasks/update/{taskId}:
 *   put:
 *     summary: Update a task.
 *     description: Update an existing task's title, description, and deadline.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: ID of the task to update.
 *         schema:
 *           type: string
 *     requestBody:
 * *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The updated title of the task.
 *               description:
 *                 type: string
 *                 description: The updated description of the task.
 *               deadline:
 *                 type: string
 *                 format: date
 *                 description: The updated deadline of the task.
 *             required:
 *                - title
 *               - deadline
 *     responses:
 *       200:
 *         description: Task updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request. Title or deadline missing.
 *       401:
 *         description: Unauthorized. User not authenticated.
 *       404:
 *         description: Task not found or not authorized.
 *       500:
 *         description: Internal server error.
 */

// Route for updating a task
router.put('/update/:taskId', authMiddleware, async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const taskId = req.params.taskId;
    const userId = req.user._id; // Assuming you have user authentication

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, user: userId },
      { title, description, deadline },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found or not authorized.' });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update the task.' });
  }
});


/**
 * @swagger
 * /api/tasks/delete/{taskId}:
 *   delete:
 *     summary: Delete a task.
 *     description: Delete an existing task.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: ID of the task to delete.
 *         schema:
 * *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized. User not authenticated.
 *       404:
 *         description: Task not found or not authorized.
 *       500:
 *         description: Internal server error.
 */

// Route for deleting a task
router.delete('/delete/:taskId', authMiddleware, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user._id; // Assuming you have user authentication

    const deletedTask = await Task.findOneAndDelete({ _id: taskId, user: userId });

    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found or not authorized.' });
    }

    res.json(deletedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete the task.' });
  }
});

module.exports = router;
