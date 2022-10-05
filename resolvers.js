import bcrypt from 'bcryptjs'
import Post from "./models/Post.model.js";
import Trip from "./models/Trip.model.js";
import User from "./models/User.models.js";

const resolvers = {
  Query: {
    getAllTrips: async () => {
      return await Trip.find();
    },

    getPost: async (_, { id }) => {
      return await Post.findById(id);
    },

    getAllUsers: async () => {
      return await User.find();
    },

    getUserById: async (_, { id }) => {
      return await User.findById(id);
    }
  },

  Mutation: {
    register: async (_, { user }) => {
      const hashedPassword = await bcrypt.hash(user.password, 10); 
      const _user = new User({ email: user.email, password: hashedPassword });

      await _user.save();
      return true; 
    },

    login: async (_, { user }, { res }) => {
      const { email, password } = user;
      const _user = await User.findOne({email});

      if (!_user) {
        return null;
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return null; 
      }

      return _user;
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
        updates.title = title;4
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
