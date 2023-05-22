import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    creatorId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    paidBy: {
      type: String,
    },
    category: {
      type: String,
      enum: ['accomodation', 'transport', 'activites', 'food', 'other'],
      default: 'other'
    }
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model("expense", ExpenseSchema);

export default Expense;
