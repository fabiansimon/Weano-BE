import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    uri: {
      type: String,
      required: true,
    },
    creatorId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    tripId: {
      type: String,
      required: true,
    },
    s3Key: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model("document", DocumentSchema);

export default Document;
