import mongoose from "mongoose";

const db = mongoose.connection;

async function isExistingUser(phoneNumber, email, googleId) {
  const User = db.model("user");

    let res;
    if (googleId) {
        res = await User.find({ $or: [{ googleId }] });
    }

    if (email && phoneNumber) {
        res = await User.find({ $or: [{email}, {phoneNumber}] });
    }
    
    if (res.length) {
        return true
    }

    return false
}

export default {
    isExistingUser
};
