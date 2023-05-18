import mongoose from "mongoose";
import dotenv from "dotenv";

import aws from 'aws-sdk'

dotenv.config();

const db = mongoose.connection;

async function isUserHost(userId, tripId) {
  const Trip = db.model('trip');

  const { hostIds } = await Trip.findById(tripId);

  return hostIds.includes(userId);
}

function getTripTypeFromDate(dateRange) {
  const { startDate, endDate } = dateRange;
  let now = new Date();
  now.setHours(23, 59, 59, 59);
  const nowTimeStamp = now.getTime() / 1000;

  let type = "";

  if (startDate < nowTimeStamp && endDate < nowTimeStamp) {
    type = "recent";
  } else if (startDate < nowTimeStamp && endDate > nowTimeStamp) {
    type = "active";
  } else if ((startDate - nowTimeStamp) / 86400 < 7) {
    type = "soon";
  } else if (startDate > nowTimeStamp && endDate > nowTimeStamp) {
    type = "upcoming";
  }

  return type;
}

async function getFreeImagesForUser(tripId, userId) {
  const Image = db.model("image");
  const Trip = db.model("trip");

  const { images: tripImages, assignedImages } = await Trip.findById(tripId);
  let userFreeImages;

  let images = await Image.find({
    _id: {
      $in: tripImages,
    },
  });

  const postedAmount = images.filter((image) => image.author === userId).length;
  const assignedAmount = assignedImages.filter((id) => id === userId).length;

  if (postedAmount > assignedAmount) {
    userFreeImages = 0;
  } else {
    userFreeImages = assignedAmount - postedAmount;
  }

  return userFreeImages;
}

async function deleteBucketItem(path) {
  const s3 = new aws.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  });

  const params = {
    Bucket: process.env.S3_BUCKET, 
    Key: path,
  };

  s3.deleteObject(params, function (err, data) {
    if (err) console.log(err, err.stack);
    console.log(data);
  });

}

export default {
  getTripTypeFromDate,
  getFreeImagesForUser,
  isUserHost,
  deleteBucketItem,
};
