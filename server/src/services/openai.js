const { GoogleGenerativeAI } = require('@google/generative-ai');

const INDIAN_CONSTITUTION_CONTEXT = `
You are a Constitutional Expert and Legislative Analyst specializing in Indian law.
Your analysis must adhere strictly to the Indian Constitution and its Basic Structure Doctrine.

Key constitutional principles to uphold:
- Article 14: Right to Equality
- Article 19: Right to Freedom (speech, assembly, movement, profession)
- Article 21: Right to Life and Personal Liberty
- Article 25-28: Freedom of Religion / Secularism
- Federalism: Respect division of powers (Union/State lists)
- Democratic principles: Free and fair elections, parliamentary democracy
- Judicial Independence: No proposal may undermine Supreme Court's powers

Filtering Rules:
1. Any proposal violating the Basic Structure Doctrine must be flagged as UNCONSTITUTIONAL
2. Proposals promoting violence, discrimination, or religious persecution must be rejected
3. Only legally viable, peaceful, progressive proposals within the Indian framework should be elevated
4. Proposals must not infringe on any Fundamental Rights (Part III of Constitution)
`;

const runAIAnalysis = async (proposalsData) => {
  // Use mock if no key OR if DEMO_MODE is enabled
  const useMock = !process.env.GEMINI_API_KEY
    || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here'
    || process.env.DEMO_MODE === 'true';

  if (useMock) {
    console.log('[AI Service] Running mock analysis (DEMO_MODE or no API key).');
    return getMockAnalysis(proposalsData);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
  });

  const proposalList = proposalsData
    .map(
      (p, i) =>
        `${i + 1}. [ID: ${p._id}] Title: "${p.title}" | Category: ${p.category} | Upvotes: ${p.upvoteCount}\nDescription: ${p.description.slice(0, 400)}...`
    )
    .join('\n\n');

  const prompt = `
Review the following ${proposalsData.length} citizen law proposals from the Jan-Mat platform.

PROPOSALS:
${proposalList}

Your task:
1. Group similar/duplicate proposals
2. Filter out unconstitutional proposals (violations of Basic Structure Doctrine, Fundamental Rights)
3. Select the TOP 5 most impactful, feasible, and legally sound proposals
4. For each top proposal, compute a Constitutional Score (0-100) and Impact Score (0-100)
5. Flag any unconstitutional proposals in a separate "needsRevision" list

Return ONLY a valid JSON object — no markdown, no code fences — in this exact format:
{
  "top5": [
    {
      "proposalId": "string",
      "title": "string",
      "whyItMatters": "string (2-3 sentences on societal impact)",
      "constitutionalScore": number,
      "constitutionalAnalysis": "string (why it is legally sound)",
      "impactScore": number,
      "sentimentSummary": "string (brief sentiment of public discourse around this topic)"
    }
  ],
  "needsRevision": [
    {
      "proposalId": "string",
      "title": "string",
      "reason": "string (which Article or constitutional principle it violates and why)"
    }
  ]
}
`;

  const result = await model.generateContent(prompt);
  const content = result.response.text();

  // Strip any accidental markdown fences Gemini might add
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini returned invalid JSON');
  return JSON.parse(jsonMatch[0]);
};

const getMockAnalysis = (proposalsData) => {
  const top = proposalsData.slice(0, 5);
  const rest = proposalsData.slice(5, 8);

  return {
    top5: top.map((p, i) => ({
      proposalId: p._id.toString(),
      title: p.title,
      whyItMatters: `This proposal directly addresses a critical gap in ${p.category.toLowerCase()} policy affecting millions of citizens. Expert consensus indicates implementation could improve quality of life measurably within 18-24 months. It represents a realistic, citizen-driven legislative priority.`,
      constitutionalScore: 85 - i * 3,
      constitutionalAnalysis: `This proposal is fully compliant with the Indian Constitution. It respects Article 14 (Equality), Article 19 (Freedom), and Article 21 (Life and Liberty). It falls within the legislative competence of Parliament under the Union List. No Fundamental Right is infringed.`,
      impactScore: 90 - i * 4,
      sentimentSummary: `Public sentiment is broadly positive. Citizens across demographics express strong support. Social media analysis shows constructive discourse with minimal polarization.`,
    })),
    needsRevision: rest.map((p) => ({
      proposalId: p._id.toString(),
      title: p.title,
      reason: `This proposal requires revision as it may conflict with Article 14 (Right to Equality) by creating differentiated treatment without a rational nexus. The drafting team should revise to ensure uniform applicability across all citizens regardless of regional or demographic factors.`,
    })),
  };
};

module.exports = { runAIAnalysis };
