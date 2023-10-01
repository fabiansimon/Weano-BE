import { ApolloError, AuthenticationError } from "apollo-server-express";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import UserController from "../controllers/UserController.js";
import dotenv from "dotenv";
dotenv.config();

const _ = null;

export const registerUser =async (_, { user }, { appToken }) => {
  if (!appToken || appToken !== process.env.APP_TOKEN) {
    throw new AuthenticationError("Not authenticated");
  }
  try {
    const { phoneNumber, email, firstName, lastName, googleIdToken, appleIdToken } = user;

    if (appleIdToken) {
      const { header: { kid }, payload: { sub: appleId, email: appleEmail } } = jwt.decode(appleIdToken, { complete: true });

      const res = await fetch('https://appleid.apple.com/auth/keys');

      if (res.status !== 200) {
        throw new ApolloError("Something went wrong");
      }

      const { keys } = await res.json();

      if (keys.findIndex(({ kid: k }) => k === kid) === -1) {
        throw new ApolloError("Invalid request");
      } 


      if (await UserController.isExistingUser(_, _, _, appleId)) {
        const _user = await User.findOne({ appleId });
        if (!_user) {
          throw new ApolloError("No user found, you need to sign up first");
        }
  
        const accessToken = jwt.sign({ userId: _user.id }, process.env.JWT_SECRET, {
          expiresIn: "365d",
        });
  
        return accessToken;
      }
      
      const _user = new User({ email: appleEmail, firstName: firstName || 'John', lastName: lastName || 'Doe', appleId, })
      await _user.save();

      const accessToken = jwt.sign({ userId: _user.id }, process.env.JWT_SECRET, {
        expiresIn: "365d",
      });

      return accessToken;
    }

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
        expiresIn: "365d",
      });

      return accessToken;
    }

    if (await UserController.isExistingUser(phoneNumber, email, _)) {
      throw new ApolloError("Already a user");
    }

    const _user = new User({ phoneNumber, email, firstName, lastName });
    await _user.save();

    const accessToken = jwt.sign({ userId: _user.id }, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });
    return accessToken;
  } catch (error) {
    throw new ApolloError(error);
  }
};
