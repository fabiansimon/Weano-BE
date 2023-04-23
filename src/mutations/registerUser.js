import { ApolloError, ValidationError } from "apollo-server-express";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import UserController from "../controllers/UserController.js";

const _ = null;

export const registerUser = async (_, { user }) => {
  try {
    const { phoneNumber, email, firstName, lastName, googleIdToken } = user;

    if (googleIdToken) {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleIdToken}`);

      if (res.status !== 200) {
        throw new ApolloError("Something went wrong");
      }

      const { sub: googleId, email, given_name, family_name, picture } = await res.json();

      if (await UserController.isExistingUser(_, _, googleId)) {
        throw new ApolloError("Already a user");
      }

      const _user = new User({ email, firstName: given_name, lastName: family_name, avatarUri: picture, googleId, })
      await _user.save();

      const accessToken = jwt.sign({ userId: _user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return accessToken;
    }

    if (await UserController.isExistingUser(phoneNumber, email, _)) {
      throw new ApolloError("Already a user");
    }

    const _user = new User({ phoneNumber, email, firstName, lastName });
    await _user.save();

    const accessToken = jwt.sign({ userId: _user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return accessToken;
  } catch (error) {
    throw new ApolloError(error);
  }
};
