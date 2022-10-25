import {
  ApolloError,
  AuthenticationError,
  ValidationError,
} from "apollo-server-express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Image from "./models/Image.model.js";
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

    getUserInitData: async (_, __, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      const userData = await User.findById(userId);

      const trips = await Trip.find({
        _id: {
          $in: userData.trips,
        },
      });

      const images = await Image.find({
        _id: {
          $in: userData.images,
        },
      });

      return {
        userData,
        trips,
        images,
      };
    },
  },

  Mutation: {
    registerUser: async (_, { user }) => {
      // const hashedPassword = await bcrypt.hash(user.password, 10);
      const { phoneNumber, email, firstName, lastName } = user;

      const res = await User.find({ $or: [{ phoneNumber }, { email }] });

      if (res.length) {
        throw new ValidationError("Already a user");
      }

      const _user = new User({ phoneNumber, email, firstName, lastName });

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

    loginUser: async (_, { user }, { res }) => {
      const { phoneNumber } = user;
      const _user = await User.findOne({ phoneNumber });

      if (!_user) {
        throw new ApolloError("No user with that phone number found");
      }

      // const valid = await bcrypt.compare(password, _user.password);
      // if (!valid) {
      //   throw new ApolloError("Password doesn't match");
      // }

      const accessToken = jwt.sign(
        { userId: _user.id },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      return accessToken;
    },

    uploadImage: async (_, { image }, { userId }) => {
      const { title, description, uri } = image;
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      const _image = new Image({ title, description, uri, ownerId: userId });
      await User.findByIdAndUpdate(userId, { $push: { images: _image.id } });

      await _image.save();
      return true;
    },

    deleteAllUsers: async () => {
      await User.deleteMany({});
      return true;
    },

    createTrip: async (_, args, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const { title, location, invitees, dateRange } = args.trip;
        const trip = new Trip({
          title,
          location,
          invitees,
          dateRange,
        });
        const { _id } = await trip.save();

        await User.findByIdAndUpdate(userId, {
          $push: { trips: _id.toString() },
        });
        return true;
      } catch (err) {
        throw new ApolloError(
          "Something went wrong creating while creating a Trip"
        );
      }
    },

    deleteTrip: async (_, { id }) => {
      await Trip.findByIdAndDelete(id);
      return "Trip successfully deleted";
    },

    deleteAllTrips: async () => {
      await Trip.deleteMany({});
      return "Trips successfully deleted";
    },

    deleteUser: async (_, __, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      await User.findByIdAndDelete(userId);
      return true;
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
