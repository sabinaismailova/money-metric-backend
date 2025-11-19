import mongoose from "mongoose";

const UserSummarySchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  year: Number,
  month: Number,

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

  monthComparison: {
    expensesChangePct: Number, // e.g., -12.4 means 12% less than prior month
    incomeChangePct: Number,
    categoryChanges: [
      {
        category: String,
        changePct: Number, // a category’s increase/decrease compared to last month
      },
    ],
  },

  summaryText: String, // precomputed natural-language summary

  lastUpdated: Date,
});

const UserSummary = mongoose.models.UserSummary || mongoose.model("UserSummary", UserSummarySchema);

export default UserSummary;
