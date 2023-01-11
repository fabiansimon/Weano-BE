import {
  ApolloError,
  AuthenticationError,
  ValidationError,
} from "apollo-server-express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import Expense from "./models/Expense.model.js";
import Image from "./models/Image.model.js";
import Invitee from "./models/Invitee.model.js";
import Poll from "./models/Poll.model.js";
import Task from "./models/Task.model.js";
import Trip from "./models/Trip.model.js";
import User from "./models/User.models.js";

const resolvers = {
  Query: {
    me: async (_, __, { userId }) => {
      if (!userId) {
        return null;
      }
      try {
        return await User.findById(userId);
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    getAllTrips: async (_, __, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        return await Trip.find();
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    getAllUsers: async (_, __, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      return await User.find();
    },

    getUserById: async (_, { id }) => {
      try {
        return await User.findById(id);
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    getTripById: async (_, { tripId }, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const trip = await Trip.findById(tripId);
        const images = await Image.find({
          _id: {
            $in: trip.images,
          },
        });

        const expenses = await Expense.find({
          _id: {
            $in: trip.expenses,
          },
        });

        const activeMembers = await User.find({
          _id: {
            $in: trip.activeMembers,
          },
        });

        const polls = await Poll.find({
          _id: {
            $in: trip.polls,
          },
        });

        const mutualTasks = await Task.find({
          _id: {
            $in: trip.mutualTasks,
          },
        });

        const privateTasks = await Task.find({
          _id: {
            $in: trip.privateTasks,
          },
        })
          .where("creatorId")
          .equals(userId);

        const invitees = await Invitee.find({
          _id: {
            $in: trip.invitees,
          },
        });

        const {
          _id: id,
          hostId,
          thumbnailUri,
          title,
          description,
          location,
          dateRange,
        } = trip;

        return {
          id,
          hostId,
          thumbnailUri,
          title,
          description,
          location,
          invitees,
          dateRange,
          activeMembers,
          expenses,
          images,
          polls,
          mutualTasks,
          privateTasks,
        };
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    getInvitationTripData: async (_, { tripId }) => {
      try {
        const { title, description, dateRange, location, hostId } =
          await Trip.findById(tripId);
        const { firstName } = await User.findById(hostId);

        return {
          title,
          description,
          dateRange,
          location,
          hostName: firstName,
        };
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    getUserInitData: async (_, __, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const userData = await User.findById(userId);

        const trips = await Trip.find({
          _id: {
            $in: userData.trips,
          },
        });

        const currentTimestamp = Date.now() / 1000;
        let recapTimestamp = new Date();
        recapTimestamp.setFullYear(recapTimestamp.getFullYear() - 1);
        recapTimestamp = Date.parse(recapTimestamp) / 1000;

        let activeTrip;
        let recapTrip;

        for (var i = 0; i < trips.length; i++) {
          const { startDate, endDate } = trips[i].dateRange;

          if (startDate < currentTimestamp && endDate > currentTimestamp) {
            activeTrip = trips[i];
          }

          if (startDate < recapTimestamp && endDate > recapTimestamp) {
            recapTrip = trips[i];
          }

          if (activeTrip && recapTrip) break;
        }

        if (activeTrip) {
          const activeTripExpenses = await Expense.find({
            _id: {
              $in: activeTrip.expenses,
            },
          });

          const activeTripPolls = await Poll.find({
            _id: {
              $in: activeTrip.polls,
            },
          });

          const activeTripActiveMembers = await User.find({
            _id: {
              $in: activeTrip.activeMembers,
            },
          });

          const activeTripMutualTasks = await Task.find({
            _id: {
              $in: activeTrip.mutualTasks,
            },
          });

          const activeTripPrivateTasks = await Task.find({
            _id: {
              $in: activeTrip.privateTasks,
            },
          })
            .where("creatorId")
            .equals(userId);

          activeTrip.polls = activeTripPolls || [];
          activeTrip.expenses = activeTripExpenses || [];
          activeTrip.mutualTasks = activeTripMutualTasks || [];
          activeTrip.privateTasks = activeTripPrivateTasks || [];
          activeTrip.activeMembers = activeTripActiveMembers || [];
        }

        const images = await Image.find({
          _id: {
            $in: userData.images,
          },
        });

        return {
          userData,
          trips,
          images,
          activeTrip,
          recapTrip,
        };
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    getImagesFromTrip: async (_, { tripId }, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const { images: tripImages } = await Trip.findById(tripId);

        let images = await Image.find({
          _id: {
            $in: tripImages,
          },
        });

        const authorsArr = images.map((image) => image.author);

        const authors = await User.find({
          _id: {
            $in: authorsArr,
          },
        });

        images = images.map((image, index) => {
          return {
            ...image._doc,
            author: authors.filter((author) => author._id == image.author)[0],
          };
        });

        return images;
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    getTripsForUser: async (_, __, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }
      try {
        const userData = await User.findById(userId);

        const trips = await Trip.find({
          _id: {
            $in: userData.trips,
          },
        });

        return trips;
      } catch (error) {
        throw new ApolloError(error);
      }
    },
  },

  Mutation: {
    registerUser: async (_, { user }) => {
      try {
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
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    loginUser: async (_, { user }, { res }) => {
      try {
        const { phoneNumber } = user;
        const _user = await User.findOne({ phoneNumber });

        if (!_user) {
          throw new ApolloError("No user with that phone number found");
        }

        const accessToken = jwt.sign(
          { userId: _user.id },
          process.env.JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );

        return accessToken;
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    uploadTripImage: async (_, { image }, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const { title, description, uri, tripId } = image;

        const _image = new Image({
          title,
          description,
          uri,
          author: userId,
          tripId,
        });
        await User.findByIdAndUpdate(userId, { $push: { images: _image.id } });
        await Trip.findByIdAndUpdate(tripId, { $push: { images: _image.id } });

        await _image.save();
        return true;
      } catch (error) {
        throw new ApolloError(error);
      }
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
        let inviteeIds = [];

        for (const email of invitees) {
          const res = await Invitee.find({ email: email });

          // Check if Invitee already exists
          if (res.length > 0) {
            inviteeIds.push(res[0]._id.toString());
          } else {
            const invitee = new Invitee({
              email,
              status: "PENDING",
              firstName: "",
              lastName: "",
            });

            const { _id } = await invitee.save();

            inviteeIds.push(_id.toString());
          }
        }

        const poll = new Poll({
          creatorId: userId,
          title: "Destination options",
          description: "",
        });

        const { _id: pollId } = await poll.save();

        const totalLocation = {
          ...location,
          votedBy: [],
        };

        const trip = new Trip({
          hostId: userId,
          title,
          description: "",
          location: totalLocation,
          invitees: inviteeIds,
          dateRange,
          activeMembers: [userId],
          destinationPoll: pollId.toString(),
        });

        const { _id } = await trip.save();

        await User.findByIdAndUpdate(userId, {
          $push: { trips: _id.toString() },
        });
        return _id;
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    deleteTrip: async (_, { id }) => {
      try {
        await Trip.findByIdAndDelete(id);
        return true;
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    deleteAllTrips: async () => {
      await Trip.deleteMany({});
      return "Trips successfully deleted";
    },

    deleteUser: async (_, __, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        await User.findByIdAndDelete(userId);
        return true;
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    updateUser: async (_, { user }, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const { avatarUri, firstName, lastName, email, phoneNumber } = user;

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

        await User.findByIdAndUpdate(userId, updates, { new: true });
        return true;
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    updateTrip: async (_, { trip }, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const {
          tripId,
          thumbnailUri,
          title,
          description,
          location,
          invitees,
          activeMembers,
          dateRange,
          images,
          expenses,
        } = trip;

        const updates = {};

        if (thumbnailUri !== undefined) {
          updates.thumbnailUri = thumbnailUri;
        }
        if (title !== undefined) {
          updates.title = title;
        }
        if (description !== undefined) {
          updates.description = description;
        }
        if (location !== undefined) {
          updates.location = {
            ...location,
            votedBy: [],
          };
        }
        if (invitees !== undefined) {
          updates.invitees = invitees;
        }
        if (activeMembers !== undefined) {
          updates.activeMembers = activeMembers;
        }
        if (dateRange !== undefined) {
          updates.dateRange = dateRange;
        }
        if (images !== undefined) {
          updates.images = images;
        }
        if (expenses !== undefined) {
          updates.expenses = expenses;
        }

        await Trip.findByIdAndUpdate(tripId, updates, { new: true });
        return true;
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    addInvitees: async (_, args, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const { tripId, emails } = args.data;

        for (const email of emails) {
          let id;
          const res = await Invitee.find({ email: email });

          // Check if Invitee already exists
          if (res.length > 0) {
            id = res[0]._id.toString();
          } else {
            const invitee = new Invitee({
              email,
              status: "PENDING",
              firstName: "",
              lastName: "",
            });

            const { _id } = await invitee.save();

            id = _id.toString();
          }

          await Trip.findByIdAndUpdate(tripId, {
            $addToSet: { invitees: id },
          });
        }

        return true;
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    removeInvitee: async (_, args, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const { tripId, email } = args.data;

        const res = await Invitee.find({ email: email });
        if (res.length <= 0) {
          throw new ApolloError("No Invitee found with that email");
        }

        const { _id } = res[0];

        await Trip.findByIdAndUpdate(tripId, {
          $pull: { invitees: _id.toString() },
        });

        return true;
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    joinTrip: async (_, { tripId }, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const user = userId.toString();

        const trip = await Trip.findById(tripId);

        if (!trip) {
          throw new ApolloError("Trip ID not valid");
        }

        const { activeMembers } = trip;

        if (activeMembers.includes(user)) {
          throw new ApolloError("User already added to Trip");
        }

        const { _id } = await Trip.findByIdAndUpdate(tripId, {
          $push: { activeMembers: user },
        });

        await User.findByIdAndUpdate(userId, {
          $push: { trips: _id.toString() },
        });

        return true;
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    createExpense: async (_, args, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const { title, amount, currency, tripId } = args.expense;
        const expense = new Expense({
          creatorId: userId,
          title,
          amount,
          currency: currency || "$",
        });

        const { _id } = await expense.save();

        await Trip.findByIdAndUpdate(tripId, {
          $push: { expenses: _id.toString() },
        });

        await User.findByIdAndUpdate(userId, {
          $push: {
            expenses: {
              expense: _id.toString(),
              trip: tripId,
            },
          },
        });
        return _id;
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    deleteExpense: async (_, args, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const { id, tripId } = args.data;

        try {
          await Expense.findByIdAndDelete(id);
          await Trip.findByIdAndUpdate(tripId, {
            $pull: { expenses: id },
          });

          return true;
        } catch (error) {
          throw new ApolloError(error);
        }
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    deletePoll: async (_, args, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const { id, tripId } = args.data;

        try {
          await Poll.findByIdAndDelete(id);
          await Trip.findByIdAndUpdate(tripId, {
            $pull: { polls: id },
          });

          return true;
        } catch (error) {
          throw new ApolloError(error);
        }
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    deleteTask: async (_, args, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const { id, tripId, isPrivate = false } = args.data;

        try {
          await Task.findByIdAndDelete(id);

          if (isPrivate) {
            await Trip.findByIdAndUpdate(tripId, {
              $pull: { privateTasks: id },
            });
          } else {
            await Trip.findByIdAndUpdate(tripId, {
              $pull: { mutualTasks: id },
            });
          }

          return true;
        } catch (error) {
          throw new ApolloError(error);
        }
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    // voteForPoll: async (_, args, { userId }) => {
    //   if (!userId) {
    //     throw new AuthenticationError("Not authenticated");
    //   }

    //   try {
    //     let { pollId } = args.poll;
    //     await Poll.findByIdAndUpdate(pollId, {
    //       $push: { polls: _id.toString() },
    //     });
    //     return _id;
    //   } catch (error) {
    //     throw new ApolloError(error);
    //   }
    // }

    createPoll: async (_, args, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        let { title, description, tripId, options } = args.poll;

        if (options) {
          options = options.map((option) => {
            const id = uuidv4();
            return {
              ...option,
              creatorId: userId,
              id,
            };
          });
        }

        const poll = new Poll({
          creatorId: userId,
          title,
          description,
          tripId,
          options,
        });

        const { _id } = await poll.save();

        await Trip.findByIdAndUpdate(tripId, {
          $push: { polls: _id.toString() },
        });
        return _id;
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    createTask: async (_, args, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        let { title, tripId, assignee, isPrivate = false } = args.task;

        const task = new Task({
          creatorId: userId,
          assignee,
          title,
        });

        const { _id } = await task.save();

        if (isPrivate) {
          await Trip.findByIdAndUpdate(tripId, {
            $push: { privateTasks: _id.toString() },
          });
        } else {
          await Trip.findByIdAndUpdate(tripId, {
            $push: { mutualTasks: _id.toString() },
          });
        }

        return _id;
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    updateTask: async (_, args, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        let { taskId, isDone } = args.data;

        const task = await Task.findByIdAndUpdate(taskId, {
          isDone,
        });

        if (!task) {
          throw new ApolloError("No task found with that ID");
        }

        return true;
      } catch (error) {
        throw new ApolloError(error);
      }
    },
  },
};

export default resolvers;
