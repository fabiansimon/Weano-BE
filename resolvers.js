import Post from "./models/Post.model.js";
import Trip from "./models/Trip.model.js";

const resolvers = {
  Query: {
    hello: () => {
      return "Hello World!";
    },

    getAllTrips: async () => {
      return await Trip.find();
    },

    getPost: async (_, { id }) => {
      return await Post.findById(id);
    },
  },

  Mutation: {
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
