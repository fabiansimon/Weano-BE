import { ApolloError, AuthenticationError } from "apollo-server-express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Post from "./models/Post.model.js";
import Trip from "./models/Trip.model.js";
import User from "./models/User.models.js";

const resolvers = {
  Query: {
    me: async (_, __, { userId }) => {
      if (!userId) {
        return null;
      }

      return await User.findById(userId);
    },

    getAllTrips: async (_, __, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }
      return await Trip.find();
    },

    getPost: async (_, { id }) => {
      return await Post.findById(id);
    },

    getAllUsers: async (_, __, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }
      return await User.find();
    },

    getUserById: async (_, { id }) => {
      return await User.findById(id);
    },
  },

  Mutation: {
    register: async (_, { user }) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const _user = new User({ email: user.email, password: hashedPassword });

      await _user.save();

      const accessToken = jwt.sign(
        { userId: _user.id },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );
      return accessToken;
    },

    login: async (_, { user }, { res }) => {
      const { email, password } = user;
      const _user = await User.findOne({ email });

      if (!_user) {
        throw new ApolloError("No user with that email found");
      }

      const valid = await bcrypt.compare(password, _user.password);
      if (!valid) {
        throw new ApolloError("Password doesn't match");
      }

      const accessToken = jwt.sign(
        { userId: _user.id },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      return accessToken;
    },

    deleteAllUsers: async () => {
      await User.deleteMany({});
      return true;
    },

    createTrip: async (_, args) => {
      const { title, location, invitees, startDate, endDate } = args.trip;
      const trip = new Trip({ title, location, invitees, startDate, endDate });

      await trip.save();
      return trip;
    },

    deleteTrip: async (_, { id }) => {
      await Trip.findByIdAndDelete(id);
      return "Trip successfully deleted";
    },

    deleteAllTrips: async () => {
      await Trip.deleteMany({});
      return "Trips successfully deleted";
    },

    updatePost: async (_, args) => {
      const { id } = args;
      const { title, description } = args.post;

      const updates = {};

      if (title !== undefined) {
        updates.title = title;
      }

      if (description !== undefined) {
        updates.description = description;
      }

      const newPost = await Post.findByIdAndUpdate(id, updates, { new: true });
      return newPost;
    },
  },
};

export default resolvers;
