const prisma = require('../config/prisma');
const {
  scoreLead,
  generateLeadSummary,
  generateFollowUpDraft,
  assessDealRisk
} = require('../services/aiService');

const getLeadScore = async (req, res, next) => {
  try {
    const { leadId } = req.body;
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const activities = await prisma.activity.findMany({ where: { leadId: lead.id } });
    const scoreResult = await scoreLead(lead, activities);

    // Save updated score to lead
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        leadScore: scoreResult.leadScore,
        intentLevel: scoreResult.intentLevel,
        scoreSignals: scoreResult.scoreSignals,
        scoreReasoning: scoreResult.scoreReasoning
      }
    });

    res.json({
      success: true,
      data: scoreResult
    });
  } catch (error) {
    next(error);
  }
};

const getLeadSummary = async (req, res, next) => {
  try {
    const { leadId } = req.body;
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const activities = await prisma.activity.findMany({
      where: { leadId: lead.id },
      orderBy: { date: 'desc' }
    });
    const deals = await prisma.deal.findMany({ where: { leadId: lead.id } });

    const summary = await generateLeadSummary(lead, activities, deals);

    res.json({
      success: true,
      data: {
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};

const getFollowUpDraft = async (req, res, next) => {
  try {
    const { leadId, type, recentNote } = req.body;
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const draft = await generateFollowUpDraft(lead, { type, recentNote });

    res.json({
      success: true,
      data: {
        draft
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDealRisk = async (req, res, next) => {
  try {
    const { dealId } = req.body;
    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    const activities = await prisma.activity.findMany({ where: { dealId: deal.id } });
    const riskResult = await assessDealRisk(deal, activities);

    await prisma.deal.update({
      where: { id: deal.id },
      data: {
        riskHealth: riskResult.riskHealth,
        riskSignals: riskResult.riskSignals,
        positiveSignals: riskResult.positiveSignals,
        recommendedAction: riskResult.recommendedAction
      }
    });

    res.json({
      success: true,
      data: riskResult
    });
  } catch (error) {
    next(error);
  }
};

const getSalesInsights = async (req, res, next) => {
  try {
    const orgId = req.organizationId;
    const deals = await prisma.deal.findMany({
      where: {
        organizationId: orgId,
        stage: { in: ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION'] }
      }
    });
    const leads = await prisma.lead.findMany({ where: { organizationId: orgId } });

    const stalledDeals = deals.filter(d => d.riskHealth === 'AT_RISK' || d.riskHealth === 'MODERATE');
    const highIntentLeads = leads.filter(l => l.leadScore >= 75 && l.status !== 'WON');

    // Find top converter
    const wonDeals = await prisma.deal.findMany({
      where: { organizationId: orgId, stage: 'WON' },
      include: {
        assignedAgent: { select: { name: true } }
      }
    });

    const agentTotals = {};
    wonDeals.forEach(d => {
      const agentName = d.assignedAgent ? d.assignedAgent.name : 'Unassigned';
      agentTotals[agentName] = (agentTotals[agentName] || 0) + Number(d.value);
    });

    let topAgentName = 'Amit Verma';
    let maxRevenue = 0;
    Object.entries(agentTotals).forEach(([name, rev]) => {
      if (rev > maxRevenue) {
        maxRevenue = rev;
        topAgentName = name;
      }
    });

    const insights = [
      {
        id: '1',
        type: 'STALLED_DEALS',
        severity: stalledDeals.length > 0 ? 'warning' : 'info',
        title: 'Deal Velocity Alert',
        message: `${stalledDeals.length} active deals have had stalled velocity or risk signals detected in the pipeline.`,
        action: 'Review Stalled Deals'
      },
      {
        id: '2',
        type: 'HIGH_INTENT',
        severity: 'success',
        title: 'High Intent Opportunities',
        message: `${highIntentLeads.length} leads show high purchase intent (>75 score) and are ready for executive outreach.`,
        action: 'View Qualified Leads'
      },
      {
        id: '3',
        type: 'TOP_PERFORMER',
        severity: 'info',
        title: 'Sales Leaderboard Milestone',
        message: `${topAgentName} has achieved the highest revenue conversion this cycle (₹${maxRevenue.toLocaleString('en-IN')}).`,
        action: 'View Team Leaderboard'
      }
    ];

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeadScore,
  getLeadSummary,
  getFollowUpDraft,
  getDealRisk,
  getSalesInsights
};
