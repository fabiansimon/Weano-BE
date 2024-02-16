import { ApolloError, AuthenticationError } from "apollo-server-express";
import Poll from "../models/Poll.model.js";

export const voteForPoll = async (_, args, { userId: {userId} }) => {
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
};
