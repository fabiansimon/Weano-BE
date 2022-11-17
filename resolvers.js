import {
  ApolloError,
  AuthenticationError,
  ValidationError,
} from "apollo-server-express";
import jwt from "jsonwebtoken";
import Expense from "./models/Expense.model.js";
import Image from "./models/Image.model.js";
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
        const tripData = await Trip.findById(tripId);
        const images = await Image.find({
          _id: {
            $in: tripData.images,
          },
        });

        const activeMembers = await User.find({
          _id: {
            $in: tripData.activeMembers,
          },
        });

        return {
          tripData,
          images,
          activeMembers,
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

    getTripsForUser: async (_, __, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const { trips } = await User.findById(userId);

        const tripsData = await Trip.find({
          _id: {
            $in: trips,
          },
        });

        return false;
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

          activeTrip.expenses = activeTripExpenses || [];
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
        const trip = new Trip({
          hostId: userId,
          title,
          description: "",
          location,
          invitees,
          dateRange,
        });
        const { _id } = await trip.save();

        await User.findByIdAndUpdate(userId, {
          $push: { trips: _id.toString() },
        });
        return true;
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
          updates.location = location;
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

    joinTrip: async (_, { tripId }, { userId }) => {
      if (!userId) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const { _id } = await Trip.findByIdAndUpdate(tripId, {
          $push: { activeMembers: userId.toString() },
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
        return true;
      } catch (error) {
        throw new ApolloError(error);
      }
    },
  },
};

export default resolvers;
