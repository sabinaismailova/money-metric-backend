import Transaction from "../models/transactionModel.js";
import UserSummary from "../models/userSummaryModel.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateSummary(summary) {
  const prompt = `
  You are a personal finance assistant. Keep a semi professional tones. Write a brief, friendly,
  motivational monthly summary based ONLY on the following JSON:
  
  ${JSON.stringify(summary, null, 2)}
  
  Guidelines:
  - 3–5 sentences max
  - Simple clear language
  - Mention % changes clearly
  - No disclaimers, no "as an AI"
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function computeMonthlySummary(userId, year, month) {
  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 1));
  const txs = await Transaction.find({
    userId,
    date: { $gte: start, $lt: end },
  });

  let income = 0;
  let expenses = 0;
  const expensesCategories = {};

  txs.forEach((t) => {
    if (t.type === "Income") {
      income += t.amount;
    } else {
      expenses += t.amount;
      expensesCategories[t.category] =
        (expensesCategories[t.category] || 0) + t.amount;
    }
  });

  const net = income - expenses;

  const breakdown = Object.entries(expensesCategories).map(
    ([category, amount]) => ({
      category,
      amount,
      pct: expenses > 0 ? Number(((amount / expenses) * 100).toFixed(1)) : 0,
    })
  );

  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;

  const prev = await UserSummary.findOne({
    userId,
    year: prevYear,
    month: prevMonth,
  }).lean();

  let incomeChangePct = 0;
  let expensesChangePct = 0;
  let categoryChanges = [];

  if (prev) {
    // --- Income & expense change ---
    incomeChangePct = prev.totals.income
      ? Number(
          (((income - prev.totals.income) / prev.totals.income) * 100).toFixed(
            1
          )
        )
      : 0;

    expensesChangePct = prev.totals.expenses
      ? Number(
          (
            ((expenses - prev.totals.expenses) / prev.totals.expenses) *
            100
          ).toFixed(1)
        )
      : 0;

    // --- Category-level change ---
    const prevCategories = {};
    prev.breakdown.forEach((b) => (prevCategories[b.category] = b.amount));

    categoryChanges = breakdown.map((b) => {
      const prevAmount = prevCategories[b.category] || 0;
      const changePct = prevAmount
        ? Number((((b.amount - prevAmount) / prevAmount) * 100).toFixed(1))
        : 0;

      return { category: b.category, changePct };
    });
  }

  const summaryText = await generateSummary({
    totals: { income, expenses, net },
    breakdown,
    monthComparison: {
      incomeChangePct,
      expensesChangePct,
      categoryChanges,
    },
  });

  await UserSummary.findOneAndUpdate(
    { userId, year, month },
    {
      totals: { income, expenses, net },
      breakdown,
      monthComparison: {
        expensesChangePct,
        incomeChangePct,
        categoryChanges,
      },
      summaryText,
      lastUpdated: new Date(),
    },
    { upsert: true }
  );
}
