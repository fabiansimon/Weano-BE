import { ApolloError, AuthenticationError } from "apollo-server-express";
import User from "../models/User.model.js";

export const updateUser = async (_, { user }, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { avatarUri, firstName, lastName, email, phoneNumber, pushToken, isProMember } =
      user;

    const updates = {};

    if (avatarUri !== undefined) {
      updates.avatarUri = avatarUri;
    }
    if (firstName !== undefined) {
      updates.firstName = firstName;
    }
    if (lastName !== undefined) {
      updates.lastName = lastName;
    }
    if (email !== undefined) {
      updates.email = email;
    }
    if (phoneNumber !== undefined) {
      updates.phoneNumber = phoneNumber;
    }
    if (pushToken !== undefined) {
      updates.pushToken = pushToken;
    }
    if (isProMember !== undefined) {
      updates.isProMember = isProMember;
    }

    await User.findByIdAndUpdate(userId, updates, { new: true });
    return true;
  } catch (error) {
    throw new ApolloError(error);
  }
};
