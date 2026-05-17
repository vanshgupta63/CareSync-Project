import Message from '../models/Message.js';

// Get conversation between two users
export const getMessages = async (req, res) => {
  const { otherId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherId },
        { sender: otherId, receiver: req.user._id },
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a message (HTTP fallback — real-time done via Socket.io)
export const sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;
  try {
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
