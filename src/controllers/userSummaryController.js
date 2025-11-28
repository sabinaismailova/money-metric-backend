import Transaction from "../models/transactionModel.js";
import UserSummary from "../models/userSummaryModel.js";
import { geminiModel } from "../config/gemini.js";

export const generateSummary = async (summary) => {
  const prompt = `
  You are a personal finance assistant. Keep a semi professional tones. Write a brief, friendly,
  motivational ${summary.mode} financial summary based ONLY on the following JSON:
  
  ${JSON.stringify(summary, null, 2)}
  
  Guidelines:
  - 3–5 sentences max
  - Simple clear language
  - Mention % changes clearly
  - No disclaimers, no "as an AI"
  - Write responses like you're an assistant answering the user's question
  `;

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
};

export const computeSummary = async (userId, year, month, mode) => {
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

  const prevYear = mode == "yearly" ? year - 1 : month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;

  const prev =
    mode === "yearly"
      ? await UserSummary.findOne({
          userId,
          year: prevYear,
          mode,
        }).lean()
      : await UserSummary.findOne({
          userId,
          year: prevYear,
          month: prevMonth,
          mode,
        }).lean();

  let incomeChangePct = 0;
  let expensesChangePct = 0;
  let categoryChanges = [];

  const percentChange = (curr, prev) => {
    if (prev === 0) {
      if (curr === 0) return 0;
      return 100;
    }
    return Number((((curr - prev) / prev) * 100).toFixed(1));
  };

  if (prev) {
    incomeChangePct = percentChange(income, prev.totals.income);

    expensesChangePct = percentChange(expenses, prev.totals.expenses);

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
    mode,
    totals: { income, expenses, net },
    breakdown,
    comparison: {
      incomeChangePct,
      expensesChangePct,
      categoryChanges,
    },
  });

  await UserSummary.findOneAndUpdate(
    { userId, year, month },
    {
      mode,
      totals: { income, expenses, net },
      breakdown,
      comparison: {
        expensesChangePct,
        incomeChangePct,
        categoryChanges,
      },
      summaryText,
      lastUpdated: new Date(),
    },
    { upsert: true }
  );
};
