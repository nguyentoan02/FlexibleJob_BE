import User from "../models/user.model.js";
import { getUser, updateUser } from "../service/user.service.js";

export const getAllUsers = async (req, res) => {
    const users = await User.find().select("-password");
    res.json(users);
};

export const getUserById = async (req, res) => {
    const { userId } = req.params;
    const result = await getUser(userId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const updateUserProfileById = async (req, res) => {
    const { userId } = req.params;
    const { firstName, lastName, packageId } = req.body;

    const updateUserProfile = {
        firstName: firstName,
        lastName: lastName,
        packageId: packageId,
    };

    const result = await updateUser(userId, updateUserProfile);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

// Ban a user account
export const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Không cho phép ban ADMIN
    if (user.role === "ADMIN") {
      return res.status(403).json({ message: "Cannot ban an admin account" });
    }

    // Kiểm tra xem tài khoản đã bị ban chưa
    if (user.isBanned) {
      return res.status(400).json({ message: "This account is already banned" });
    }

    user.isBanned = true;
    await user.save();

    return res.status(200).json({ 
      message: "User has been banned successfully",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isBanned: user.isBanned
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Unban a user account
export const unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra xem tài khoản đã được unban chưa
    if (!user.isBanned) {
      return res.status(400).json({ message: "This account is not banned" });
    }

    user.isBanned = false;
    await user.save();

    return res.status(200).json({ 
      message: "User has been unbanned successfully",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isBanned: user.isBanned
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
