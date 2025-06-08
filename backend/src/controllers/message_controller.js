import { NlpManager } from 'node-nlp';//import nlp
import User from "../models/user_model.js";
import Message from '../models/message_model.js'
import cloudinary from '../lib/cloudinary.js'
import { getReceiverSocketId, io } from "../lib/socket.js";


const manager = new NlpManager({ languages: ['en'], forceNER: true });

// get user data which is currently logged in
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(filteredUsers);

  } catch (error) {
    console.error("Error in getUsersForSidebar", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}
// get meessage form database
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId }
      ]
    })
    res.status(200).json(messages);
  }

  catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}
// Save data in database
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    // Sentiment analysis logic
    // let sentiment = 'neutral';
    // let sentimentScore = 0;

    // if (text) {
    //   const result = await manager.process('en', text);
    //   sentimentScore = result.sentiment.score;
    //   sentiment =
    //     result.sentiment.vote === 'positive'
    //       ? 'positive'
    //       : result.sentiment.vote === 'negative'
    //         ? 'negative'
    //         : 'neutral';
    // }
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      // sentiment,
      // sentimentScore,
    });
    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  }
  catch (error) {
    console.log("Error in sendMessage Controller", error.message);
    res.status(500).json({ error: 'Internal server error' });

  }
}