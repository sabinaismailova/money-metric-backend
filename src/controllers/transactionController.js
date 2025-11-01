import mongoose from "mongoose";
import Transaction from "../models/transactionModal.js";
import {
    toZonedTime
} from "date-fns-tz";
import {
    TZDate
} from "@date-fns/tz";

function parseDateToUTC(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

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
        const userId = req.user._id;

        const transactionData = {
            userId,
            type,
            category,
            amount: Number(amount),
            date: parseDateToUTC(date),
            note,
            isRecurring,
            timezone,
        };

        if (isRecurring) {
            transactionData.recurrenceInterval = recurrenceInterval;
            transactionData.nextRecurrence = parseDateToUTC(nextRecurrence);
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
        const userId = req.user._id;
        const transactions = await Transaction.find({
            userId
        }).sort({
            date: -1
        });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching transactions",
            error
        });
    }
};

function addMonthsSafe(date, months) { //prevents months rolling over(Ex: February would roll into March but this makes sure the transaction is added at last day of February)
    const next = new Date(date);
    const day = next.getDate();
    //add months to try to move the same day next month 
    next.setMonth(next.getMonth() + months);
    //if the day changes from the origional date's day then that means we rolled over to the next month 
    //setDate(0) to get to the last day of the previous month from the month we rolled over into
    if(next.getDate() !== day){
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

export const processRecurringTransactions = async () => {
    try {
        const today = new Date()
        const recurring = await Transaction.find({
            isRecurring: true,
            nextRecurrence: {
                $lte: today
            },
        });

        for (const tx of recurring) {
            const userLocalDate = new TZDate(today, tx.timezone) // date object with timezone value and internal which is UTC converted to timezone
            const userLocalNow = userLocalDate.internal // actual date and time at the timezone specified in userLocalDate
            const nextRecurrenceLocal = today // UTC time 

            // this makes sure the transaction is created at the correct date for every user 
            //based on their timezone at 12 AM as 12AM in UTC timezone is still the day before for some timezones like ET

            if (
                userLocalNow.getFullYear() === nextRecurrenceLocal.getFullYear() &&
                userLocalNow.getMonth() === nextRecurrenceLocal.getMonth() &&
                userLocalNow.getDate() === nextRecurrenceLocal.getDate() &&
                userLocalNow.getHours() === 0
            ) {
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
            }
        }

        console.log("Recurring transaction processor completed.");
    } catch (err) {
        console.error("Error processing recurring transactions:", err);
    }
};