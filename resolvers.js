import { createExpense } from "./src/mutations/createExpense.js";
import { createPoll } from "./src/mutations/createPoll.js";
import { createTask } from "./src/mutations/createTask.js";
import { createTrip } from "./src/mutations/createTrip.js";
import { deleteExpense } from "./src/mutations/deleteExpense.js";
import { deletePoll } from "./src/mutations/deletePoll.js";
import { deleteTask } from "./src/mutations/deleteTask.js";
import { deleteTripById } from "./src/mutations/deleteTripById.js";
import { deleteUser } from "./src/mutations/deleteUser.js";
import { joinTrip } from "./src/mutations/joinTrip.js";
import { loginUser } from "./src/mutations/loginUser.js";
import { registerUser } from "./src/mutations/registerUser.js";
import { updateTrip } from "./src/mutations/updateTrip.js";
import { updateUser } from "./src/mutations/updateUser.js";
import { uploadTripImage } from "./src/mutations/uploadTripImage.js";
import { voteForPoll } from "./src/mutations/voteForPoll.js";
import { updateTask } from "./src/mutations/updateTask.js";
import { getImagesFromTrip } from "./src/queries/getImagesFromTrip.js";
import { getInvitationTripData } from "./src/queries/getInvitationTripData.js";
import { getTripById } from "./src/queries/getTripById.js";
import { getTripsForUser } from "./src/queries/getTripsForUser.js";
import { getUserInitData } from "./src/queries/getUserInitData.js";
import { removeUserFromTrip } from "./src/mutations/removeUserFromTrip.js";
import { sendReminder } from "./src/mutations/sendReminder.js";

const resolvers = {
  Query: {
    getTripById,
    getInvitationTripData,
    getUserInitData,
    getImagesFromTrip,
    getTripsForUser,
  },

  Mutation: {
    registerUser,
    loginUser,
    uploadTripImage,
    createTrip,
    deleteTripById,
    deleteUser,
    updateUser,
    updateTrip,
    joinTrip,
    createExpense,
    deleteExpense,
    deletePoll,
    deleteTask,
    voteForPoll,
    createPoll,
    createTask,
    updateTask,
    removeUserFromTrip,
    sendReminder,
  },
};

export default resolvers;
