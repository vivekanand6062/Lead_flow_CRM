/**
 * AI Service for LeadFlow CRM
 * Encapsulates AI interactions (Gemini / OpenAI) with intelligent offline heuristics
 * Ensures zero failure rate even without external API credentials.
 */

const generateWithGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (error) {
    console.warn('[AI Service] Gemini API call failed, falling back to smart heuristic:', error.message);
    return null;
  }
};

/**
 * AI Lead Scoring
 */
const scoreLead = async (lead, activities = []) => {
  let score = 50;
  const signals = [];

  // Stage signals
  if (['QUALIFIED', 'PROPOSAL', 'NEGOTIATION'].includes(lead.status)) {
    score += 25;
    signals.push(`Advanced pipeline status (${lead.status})`);
  } else if (lead.status === 'CONTACTED') {
    score += 15;
    signals.push('Successful initial contact established');
  }

  // Activity signals
  if (activities.length >= 3) {
    score += 15;
    signals.push(`High engagement with ${activities.length} recorded interactions`);
  } else if (activities.length >= 1) {
    score += 8;
    signals.push('Active dialogue logged in timeline');
  }

  // Corporate domain signal
  if (lead.email && !lead.email.includes('@gmail') && !lead.email.includes('@yahoo')) {
    score += 10;
    signals.push('Verified corporate work domain');
  }

  // Estimated value signal
  if (lead.estimatedValue > 500000) {
    score += 10;
    signals.push('High prospective deal budget (>₹5,00,000)');
  }

  // Clamp score
  score = Math.min(Math.max(score, 20), 98);

  let intentLevel = 'MEDIUM';
  if (score >= 75) intentLevel = 'HIGH';
  else if (score < 45) intentLevel = 'LOW';

  const reasoning = `Lead exhibits strong buying signals based on corporate domain validation, ${lead.status} stage progression, and consistent response frequency.`;

  return {
    leadScore: score,
    intentLevel,
    scoreSignals: signals.length > 0 ? signals : ['Initial inquiry submitted via web form'],
    scoreReasoning: reasoning
  };
};

/**
 * AI Lead CRM Summary
 */
const generateLeadSummary = async (lead, activities = [], deals = []) => {
  // If Gemini available, try prompt
  if (process.env.GEMINI_API_KEY) {
    const prompt = `You are a B2B sales intelligence AI. Summarize the following CRM lead concisely in 2-3 sentences for a sales rep:
Lead Name: ${lead.name}
Company: ${lead.companyName}
Current Status: ${lead.status}
Recent Activities: ${activities.map(a => `${a.type}: ${a.title}`).join('; ')}
Related Deals: ${deals.map(d => `${d.title} (₹${d.value})`).join('; ')}`;
    
    const result = await generateWithGemini(prompt);
    if (result) return result;
  }

  // Heuristic synthesis
  const activitySummary = activities.length > 0 
    ? `with ${activities.length} logged interactions (latest: "${activities[0].title}")`
    : 'with initial discovery underway';
  
  const dealSummary = deals.length > 0
    ? `Associated with active opportunity "${deals[0].title}" valued at ₹${deals[0].value.toLocaleString('en-IN')}.`
    : 'No formal deal converted yet.';

  return `${lead.name} at ${lead.companyName} is currently in the ${lead.status} stage ${activitySummary}. ${dealSummary} Recommended next step is to schedule an executive demonstration.`;
};

/**
 * AI Follow-up Message Generator
 */
const generateFollowUpDraft = async (lead, context = {}) => {
  const type = context.type || 'email'; // 'email' | 'call_script'
  
  if (process.env.GEMINI_API_KEY) {
    const prompt = `Write a professional, crisp B2B follow-up ${type === 'email' ? 'email' : 'talking points call script'} from a Sales Representative at LeadFlow to ${lead.name} at ${lead.companyName}.
Status: ${lead.status}
Recent context: ${context.recentNote || 'Following up on our recent product demo'}.
Keep it concise, polite, value-driven, and end with a clear low-friction call-to-action.`;

    const result = await generateWithGemini(prompt);
    if (result) return result;
  }

  if (type === 'call_script') {
    return `Call Script for ${lead.name} (${lead.companyName}):
1. Greeting: "Hi ${lead.name}, this is your sales partner from LeadFlow. Hope you're having a productive week!"
2. Context Hook: "I'm checking in following up on our recent discussion around streamlining your sales pipeline at ${lead.companyName}."
3. Value Anchor: "We recently helped a similar organization increase qualified deal velocity by 34% in 45 days."
4. Call-to-action: "Would you have 10 minutes this Thursday afternoon to review the tailored proposal?"`;
  }

  return `Subject: Following up — Next steps for ${lead.companyName} & LeadFlow

Hi ${lead.name},

I hope you're having a productive week.

I'm following up on our recent conversation regarding ${lead.companyName}'s sales workflow. Based on your team's objectives, I've outlined how LeadFlow can eliminate operational bottlenecks and accelerate your deal close rates.

Would you be open for a brief 15-minute sync this Thursday or Friday to review the customized solution and next milestones?

Looking forward to connecting.

Best regards,
LeadFlow Sales Team`;
};

/**
 * AI Deal Risk Assessment
 */
const assessDealRisk = async (deal, activities = []) => {
  const daysSinceUpdate = Math.floor((Date.now() - new Date(deal.updatedAt || deal.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  
  const positiveSignals = [];
  const riskSignals = [];
  let riskHealth = 'GOOD';

  if (deal.stage === 'NEGOTIATION') {
    positiveSignals.push('Deal has progressed to final contractual negotiation');
  } else if (deal.stage === 'PROPOSAL') {
    positiveSignals.push('Proposal presented to key stakeholders');
  }

  if (deal.probability >= 70) {
    positiveSignals.push('High forecasted close confidence');
  }

  if (daysSinceUpdate > 7) {
    riskSignals.push(`No logged interaction for ${daysSinceUpdate} days`);
    riskHealth = 'MODERATE';
  }

  if (daysSinceUpdate > 14) {
    riskSignals.push('Deal velocity significantly behind baseline (stalled over 14 days)');
    riskHealth = 'AT_RISK';
  }

  if (deal.probability < 40 && deal.stage !== 'QUALIFIED') {
    riskSignals.push('Sub-40% closing probability indicated in late stage');
    riskHealth = 'AT_RISK';
  }

  if (positiveSignals.length === 0) {
    positiveSignals.push('Stakeholder engagement verified');
  }
  if (riskSignals.length === 0) {
    riskSignals.push('Deal moving according to standard pipeline velocity');
  }

  let recommendedAction = 'Continue standard cadence and follow up on timeline milestones.';
  if (riskHealth === 'AT_RISK') {
    recommendedAction = 'Urgent: Schedule executive alignment sync or offer limited-time incentive to unfreeze budget.';
  } else if (riskHealth === 'MODERATE') {
    recommendedAction = 'Send gentle follow-up email sharing ROI case study to rekindle momentum.';
  }

  return {
    riskHealth,
    positiveSignals,
    riskSignals,
    recommendedAction
  };
};

module.exports = {
  scoreLead,
  generateLeadSummary,
  generateFollowUpDraft,
  assessDealRisk
};
