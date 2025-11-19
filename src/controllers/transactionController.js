import mongoose from "mongoose";
import Transaction from "../models/transactionModel.js";
import { TZDate } from "@date-fns/tz";

export const addTransaction = async (req, res) => {
  try {
    const {
      type,
      category,
      amount,
      date,
      note,
      isRecurring,
      recurrenceInterval,
      nextRecurrence,
      timezone,
    } = req.body;
    const userId = req.user.userId;

    const transactionData = {
      userId,
      type,
      category,
      amount: Number(amount),
      date: date,
      note,
      isRecurring,
      timezone,
    };

    if (isRecurring) {
      transactionData.recurrenceInterval = recurrenceInterval;
      transactionData.nextRecurrence = nextRecurrence;
    }

    const transaction = await Transaction.create(transactionData);

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({
      message: "Error adding transaction",
      error: error.message,
      stack: error.stack,
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const transactions = await Transaction.find({
      userId,
    }).sort({
      date: -1,
    });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching transactions",
      error,
    });
  }
};

export const getTransactionsByMonthYear = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month, year } = req.params;

    const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, parseInt(month)+1, 0, 23, 59, 59));

    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate, $lt: endDate },
    }).sort({
      date: -1,
    });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching transactions",
      error,
    });
  }
};

function addMonthsSafe(date, months) {
  //prevents months rolling over(Ex: February would roll into March but this makes sure the transaction is added at last day of February)
  const next = new Date(date);
  const day = next.getDate();
  //add months to try to move the same day next month
  next.setMonth(next.getMonth() + months);
  //if the day changes from the origional date's day then that means we rolled over to the next month
  //setDate(0) to get to the last day of the previous month from the month we rolled over into
  if (next.getDate() !== day) {
    next.setDate(0);
  }
  return next;
}

function getNextRecurrenceDate(currentDate, interval) {
  const next = new Date(currentDate);
  switch (interval) {
    case "Daily":
      next.setDate(next.getDate() + 1);
      break;
    case "Weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "Biweekly":
      next.setDate(next.getDate() + 14);
      break;
    case "Monthly":
      return addMonthsSafe(next, 1);
    case "Yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      break;
  }
  return next;
}

export const processRecurringTransactions = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);
    const recurring = await Transaction.find({
      isRecurring: true,
      nextRecurrence: { $gte: startOfDay, $lte: endOfDay },
    });

    for (const tx of recurring) {
      const userLocalDate = new TZDate(today, tx.timezone); // date object with timezone value and internal which is UTC converted to timezone
      const userLocalNow = userLocalDate.internal; // actual date and time at the timezone specified in userLocalDate

      console.log("Triggered recurring transaction processing at:", today);

      // this makes sure the transaction is created at the correct date for every user
      //based on their timezone at 12 AM as 12AM in UTC timezone is still the day before for some timezones like ET

      if (userLocalNow.getHours() === 0) {
        const newTx = new Transaction({
          ...tx.toObject(),
          _id: new mongoose.Types.ObjectId(),
          date: today,
          createdAt: today,
          updatedAt: today,
        });

        const nextDate = getNextRecurrenceDate(today, tx.recurrenceInterval);
        newTx.nextRecurrence = nextDate;

        await newTx.save();
        console.log("Recurring transaction created at:", today);
      }
    }
    res.status(200).json({ message: "Recurring transactions processed" });
  } catch (err) {
    console.error("Error processing recurring transactions:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
