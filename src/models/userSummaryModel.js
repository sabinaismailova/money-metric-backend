import mongoose from "mongoose";

const UserSummarySchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  year: Number,
  month: Number,
  mode: {
    type: String,
    enum: ["monthly", "yearly"],
  },

  totals: {
    income: Number,
    expenses: Number,
    net: Number,
  },

  breakdown: [
    {
      category: String,
      amount: Number,
      pct: Number,
    },
  ],

  comparison: {
    expensesChangePct: Number,
    incomeChangePct: Number,
    categoryChanges: [
      {
        category: String,
        changePct: Number,
      },
    ],
  },

  summaryText: String,

  lastUpdated: Date,
});

const UserSummary = mongoose.models.UserSummary || mongoose.model("UserSummary", UserSummarySchema);

export default UserSummary;
