import mongoose from "mongoose";

const InviteeSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "PENDING",
  },
});

const Invitee = mongoose.model("invitee", InviteeSchema);

export default Invitee;
