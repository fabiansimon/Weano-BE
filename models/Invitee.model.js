import mongoose from "mongoose";

const InviteeSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "UNSUCCESSFUL", "ACCEPTED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

const Invitee = mongoose.model("invitee", InviteeSchema);

export default Invitee;
