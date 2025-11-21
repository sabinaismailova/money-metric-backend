import { geminiModel } from "../config/gemini.js"

export const answer = async (question, summary) =>{

    const prompt = `
You are a financial insights assistant.
Answer the user's question based ONLY on the following JSON:

${JSON.stringify(summary, null, 2)}

USER QUESTION:
"${question}"

Instructions:
- Keep answer concise (1–3 short paragraphs)
- Use numbers from the data
- If something isn't in the JSON, say "The data does not include that."
- Never hallucinate
`;

    const result = await geminiModel.generateContent(prompt);
    return result
};
