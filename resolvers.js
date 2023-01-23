import {
  ApolloError,
  AuthenticationError,
  ValidationError,
} from "apollo-server-express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import Expense from "./src/models/Expense.model.js";
import Image from "./src/models/Image.model.js";
import Poll from "./src/models/Poll.model.js";
import Task from "./src/models/Task.model.js";
import Trip from "./src/models/Trip.model.js";
import User from "./src/models/User.models.js";

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

        const now = Date.now() / 1000;
        const tripData = await Promise.all(
          trips.map(async (trip) => {
            let _images = await Image.find({
              _id: {
                $in: trip.images,
              },
            });

            const isActive =
              trip.dateRange.startDate < now && trip.dateRange.endDate > now;

            let totalAmount = 0;
            if (isActive) {
              const _expenses = await Expense.find({
                _id: {
                  $in: trip.expenses,
                },
              });

              var amount = 0;
              for (let expense of _expenses) {
                amount = amount + expense.amount;
              }

              totalAmount = amount;
            }

            trip.expensesTotal = totalAmount;
            trip.images = _images;
            return trip;
          })
        );

        const images = await Image.find({
          _id: {
            $in: userData.images,
          },
        });

        return {
          userData,
          trips: tripData,
          images,
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

        images = images.map((image) => {
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

        const tripData = await Trip.find({
          _id: {
            $in: userData.trips,
          },
        });

        const trips = await Promise.all(
          tripData.map(async (trip) => {
            let _images = await Image.find({
              _id: {
                $in: trip.images,
              },
            });

            trip.images = _images;
            return trip;
          })
        );

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

    createTrip: async (_, args, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const { title, location, dateRange } = args.trip;

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

    deleteTripById: async (_, { tripId }, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const trip = await Trip.findById(tripId);

        const {
          _id,
          mutualTasks,
          privateTasks,
          destinationPoll,
          polls: otherPolls,
          activeMembers,
        } = trip;

        const tasks = mutualTasks.concat(privateTasks);

        let polls;
        if (destinationPoll) {
          polls = otherPolls.concat(destinationPoll);
        }

        await Task.deleteMany({ _id: { $in: tasks } });
        await Poll.deleteMany({ _id: { $in: polls } });

        await activeMembers.forEach(async (member) => {
          await User.findByIdAndUpdate(member, {
            $pull: { trips: _id.toString() },
          });
        });

        await Trip.findByIdAndDelete(tripId);

        return true;
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    deleteUser: async (_, __, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const user = await User.findById(userId);

        const { trips } = user;

        await trips.forEach(async (trip) => {
          // const tripExpenses = expenses
          //   .map((e) => {
          //     if (e.trip === trip) {
          //       return e.expense;
          //     }
          //   })
          //   .filter(Boolean);

          const tripData = await Trip.findByIdAndUpdate(trip, {
            $pull: { activeMembers: { userId } },
          });

          if (!tripData) {
            return;
          }

          const { _id, activeMembers, hostId } = tripData;

          // Check if it was last user || if not reassign host
          if (activeMembers.length <= 0) {
            await Trip.findByIdAndDelete(_id.toString());
          } else if (hostId === userId) {
            await Trip.findByIdAndUpdate(trip, {
              $set: { hostId: activeMembers[0] },
            });
          }
        });

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
        const {
          avatarUri,
          firstName,
          lastName,
          email,
          phoneNumber,
          pushToken,
        } = user;

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

    voteForPoll: async (_, args, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        let { pollId, optionId } = args.data;
        const poll = await Poll.findById(pollId);

        let { options } = poll;
        const oIndex = options.findIndex((option) => option.id === optionId);

        const uIndex = options[oIndex].votes.indexOf(userId);

        if (uIndex === -1) {
          options[oIndex].votes.push(userId);
        } else {
          options[oIndex].votes.splice(uIndex, 1);
        }

        await Poll.findByIdAndUpdate(pollId, {
          $set: { options },
        });

        return true;
      } catch (error) {
        throw new ApolloError(error);
      }
    },

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
