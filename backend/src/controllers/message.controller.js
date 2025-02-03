import User from "../models/user.model.js";
import Message from "../models/messege.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";
import {getReceiverSocketId} from '../lib/socket.js'

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id; //get user fro protectd route
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar :", error.message);
    res.status(500).json({ error: "internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatID } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatID },
        { senderId: userToChatID, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("error In GetMessage controller :", error.message);
    res.status(500).json({ error: "internal Server Error" });
  }
};

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

    //message
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // todo: realTime functionality goes here =>Use Socket Io

    const receiverSocketId = getReceiverSocketId(receiverId);
    if(receiverSocketId){
      io.to(receiverSocketId).emit("newMessage",newMessage)
    }
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("error in sendMessage controller :", error.message);
     res.status(500).json({ error: "internal Server Error" });
  }
};
