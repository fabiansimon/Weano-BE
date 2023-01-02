import mongoose from "mongoose";

const InviteeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "PENDING",
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Invitee = mongoose.model("invitee", InviteeSchema);

export default Invitee;
