const { GoogleGenerativeAI } = require('@google/generative-ai');

let _genAI;
const getModel = () => {
  const isPlaceholder = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('your_gemini_api_key');
  
  if (isPlaceholder) {
    console.warn('⚠️ [AI] Using Mock Mode - GEMINI_API_KEY not found or is placeholder.');
    return {
      generateContent: async (prompt) => {
        // Mock responses based on prompt keywords
        if (prompt.includes('interview questions')) return { response: { text: () => JSON.stringify({ questions: ["Tell me about yourself.", "What are your core technical skills?", "How do you handle conflict in a team?", "Describe a project you are proud of.", "Why should we hire you?"] }) } };
        
        return { response: { text: () => JSON.stringify({ score: 8, strengths: ["Clear communication", "Relevant technical background"], improvements: ["Add more quantitative results"], summary: "The answer shows good competence and alignment with the role." }) } };
      }
    };
  }

  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

const parseGeminiJSON = (rawText) => {
  try {
    const cleaned = rawText
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('[AI] JSON Parse failed. Raw text:', rawText);
    throw err;
  }
};

/**
 * @param {object} profileData - Candidate profile info
 * @param {string} jobRole    - Target role
 * @returns {Array<string>}
 */
const generateQuestions = async (profileData = {}, jobRole) => {
  const profileString = JSON.stringify(profileData, null, 2);
  
  const prompt = `
You are a professional HR interviewer.
Based on this candidate profile:
${profileString}

Generate 5 relevant first-round interview questions for the role of "${jobRole}".
Return ONLY valid JSON (no markdown):
{
  "questions": ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
}
`.trim();

  try {
    const result = await getModel().generateContent(prompt);
    const parsed = parseGeminiJSON(result.response.text());
    return Array.isArray(parsed.questions) ? parsed.questions : [];
  } catch (err) {
    console.error('[AI] generateQuestions failed:', err.message);
    return [
      `Tell me about your experience related to ${jobRole}.`,
      "What are your greatest strengths?",
      "Describe a challenging problem you solved recently.",
      "Why are you interested in this position?",
      "Where do you see yourself in 5 years?"
    ];
  }
};

/**
 * @returns {{ score: number, strengths: string[], improvements: string[], summary: string }}
 */
const evaluateAnswer = async (question, answer, jobRole) => {
  const prompt = `
You are an expert HR evaluator.
Evaluate this answer for a "${jobRole}" position.

Question: "${question}"
Answer: "${answer}"

Evaluate on:
- Technical knowledge
- Communication clarity
- Confidence
- Problem-solving

Return ONLY valid JSON (no markdown):
{
  "score": <number 0-10>,
  "strengths": ["string"],
  "improvements": ["string"],
  "summary": "string"
}
`.trim();

  try {
    const result = await getModel().generateContent(prompt);
    return parseGeminiJSON(result.response.text());
  } catch (err) {
    console.error('[AI] evaluateAnswer failed:', err.message);
    return {
      score: 5,
      strengths: ["Answered the question"],
      improvements: ["Provide more specific examples"],
      summary: "Basic response provided."
    };
  }
};

/**
 * @param {Array} questions - Array of { questionText, order }
 * @param {Array} answers   - Array of { questionIndex, answerText, score }
 * @param {string} jobRole
 * @returns {{ score: number, strengths: string[], improvements: string[], summary: string }}
 */
const finalEvaluation = async (questions, answers, jobRole) => {
  const transcript = questions
    .map((q, i) => {
      const ans = answers.find((a) => a.questionIndex === i);
      return `Q: ${q.questionText}\nA: ${ans?.answerText || '(no answer)'}`;
    })
    .join('\n\n');

  const prompt = `
You are evaluating a candidate interview for the role of "${jobRole}".

Transcript:
${transcript}

Evaluate on:
- Technical knowledge
- Communication clarity
- Confidence
- Problem-solving

Return ONLY valid JSON (no markdown):
{
  "score": <number 0-10>,
  "strengths": [