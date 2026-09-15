const prisma = require('../config/prisma');
const { serialize, serializeEntity } = require('../utils/serializer');

const getDashboardAnalytics = async (req, res, next) => {
  try {
    const { role } = req.user;
    const orgId = req.organizationId;

    if (role === 'ADMIN') {
      // 1. ADMIN METRICS
      const [totalManagers, totalAgents, totalLeads] = await Promise.all([
        prisma.user.count({ where: { organizationId: orgId, role: 'MANAGER' } }),
        prisma.user.count({ where: { organizationId: orgId, role: 'SALES_AGENT' } }),
        prisma.lead.count({ where: { organizationId: orgId } })
      ]);

      const deals = await prisma.deal.findMany({ where: { organizationId: orgId } });
      const activeDeals = deals.filter(d => ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION'].includes(d.stage));
      const wonDeals = deals.filter(d => d.stage === 'WON');
      const lostDeals = deals.filter(d => d.stage === 'LOST');

      const totalRevenue = wonDeals.reduce((sum, d) => sum + Number(d.value), 0);
      const pipelineValue = activeDeals.reduce((sum, d) => sum + Number(d.value), 0);
      const closedCount = wonDeals.length + lostDeals.length;
      const conversionRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 32;

      // Lead funnel
      const allLeads = await prisma.lead.findMany({
        where: { organizationId: orgId },
        select: { status: true }
      });
      const funnel = {
        NEW: allLeads.filter(l => l.status === 'NEW').length,
        CONTACTED: allLeads.filter(l => l.status === 'CONTACTED').length,
        QUALIFIED: allLeads.filter(l => l.status === 'QUALIFIED').length,
        PROPOSAL: allLeads.filter(l => l.status === 'PROPOSAL').length,
        NEGOTIATION: allLeads.filter(l => l.status === 'NEGOTIATION').length,
        WON: allLeads.filter(l => l.status === 'WON').length,
        LOST: allLeads.filter(l => l.status === 'LOST').length
      };

      // Managers Leaderboard
      const managers = await prisma.user.findMany({
        where: { organizationId: orgId, role: 'MANAGER' },
        include: {
          directReports: { where: { role: 'SALES_AGENT' }, select: { id: true } },
          managedDeals: { where: { stage: 'WON' }, select: { value: true } }
        }
      });

      const managerLeaderboard = managers.map((m) => {
        const revenue = m.managedDeals.reduce((sum, d) => sum + Number(d.value), 0);
        const quota = m.targetQuota ? Number(m.targetQuota) : 5000000;
        const attainment = quota > 0 ? Math.round((revenue / quota) * 100) : 0;
        const agentCount = m.directReports.length;

        return {
          id: m.id,
          _id: m.id,
          name: m.name,
          email: m.email,
          department: m.department,
          agentCount,
          quota,
          revenue,
          attainment
        };
      });

      // Recent Activity
      const recentActivities = await prisma.activity.findMany({
        where: { organizationId: orgId },
        include: {
          user: { select: { id: true, name: true, role: true } }
        },
        orderBy: { date: 'desc' },
        take: 8
      });

      return res.json({
        success: true,
        metrics: {
          totalManagers,
          totalSalesAgents: totalAgents,
          totalLeads,
          activeDealsCount: activeDeals.length,
          wonDealsCount: wonDeals.length,
          totalRevenue,
          pipelineValue,
          conversionRate
        },
        funnel,
        managerLeaderboard,
        recentActivities: serialize(recentActivities)
      });

    } else if (role === 'MANAGER') {
      // 2. MANAGER METRICS
      const teamAgents = await prisma.user.findMany({
        where: { managerId: req.user.id, role: 'SALES_AGENT' },
        include: {
          assignedLeads: { select: { id: true } },
          assignedDeals: { where: { stage: 'WON' }, select: { value: true } }
        }
      });
      const teamAgentIds = teamAgents.map(a => a.id);

      const teamLeads = await prisma.lead.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { assignedAgentId: { in: teamAgentIds } },
            { managerId: req.user.id }
          ]
        }
      });

      const qualifiedLeads = teamLeads.filter(l => ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION'].includes(l.status));

      const teamDeals = await prisma.deal.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { assignedAgentId: { in: teamAgentIds } },
            { managerId: req.user.id }
          ]
        }
      });

      const activeDeals = teamDeals.filter(d => ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION'].includes(d.stage));
      const wonDeals = teamDeals.filter(d => d.stage === 'WON');
      const lostDeals = teamDeals.filter(d => d.stage === 'LOST');
      const teamRevenue = wonDeals.reduce((sum, d) => sum + Number(d.value), 0);
      const pipelineValue = activeDeals.reduce((sum, d) => sum + Number(d.value), 0);
      const closedDeals = wonDeals.length + lostDeals.length;
      const conversionRate = closedDeals > 0 ? Math.round((wonDeals.length / closedDeals) * 100) : 38;

      const followUps = await prisma.followUp.findMany({
        where: {
          organizationId: orgId,
          OR: [{ userId: { in: teamAgentIds } }, { userId: req.user.id }],
          status: { not: 'COMPLETED' }
        }
      });
      const overdueFollowUps = followUps.filter(f => new Date(f.dueDate) < new Date()).length;

      // Agent Leaderboard
      const agentLeaderboard = teamAgents.map((agent) => {
        const revenue = agent.assignedDeals.reduce((sum, d) => sum + Number(d.value), 0);
        const leadsCount = agent.assignedLeads.length;
        const quota = agent.targetQuota ? Number(agent.targetQuota) : 2000000;
        const attainment = quota > 0 ? Math.round((revenue / quota) * 100) : 0;

        return {
          id: agent.id,
          _id: agent.id,
          name: agent.name,
          email: agent.email,
          quota,
          revenue,
          attainment,
          leadsCount,
          wonCount: agent.assignedDeals.length
        };
      });

      // Team Pipeline
      const pipeline = {
        QUALIFIED: teamDeals.filter(d => d.stage === 'QUALIFIED').length,
        PROPOSAL: teamDeals.filter(d => d.stage === 'PROPOSAL').length,
        NEGOTIATION: teamDeals.filter(d => d.stage === 'NEGOTIATION').length,
        WON: wonDeals.length,
        LOST: lostDeals.length
      };

      const recentActivities = await prisma.activity.findMany({
        where: {
          organizationId: orgId,
          OR: [{ userId: { in: teamAgentIds } }, { userId: req.user.id }]
        },
        include: {
          user: { select: { id: true, name: true, role: true } }
        },
        orderBy: { date: 'desc' },
        take: 8
      });

      return res.json({
        success: true,
        metrics: {
          totalSalesAgents: teamAgents.length,
          teamLeadsCount: teamLeads.length,
          qualifiedLeadsCount: qualifiedLeads.length,
          activeDealsCount: activeDeals.length,
          wonDealsCount: wonDeals.length,
          teamRevenue,
          pipelineValue,
          conversionRate,
          pendingFollowUpsCount: followUps.length,
          overdueFollowUpsCount: overdueFollowUps
        },
        pipeline,
        agentLeaderboard,
        recentActivities: serialize(recentActivities)
      });

    } else {
      // 3. SALES_AGENT METRICS
      const myLeads = await prisma.lead.findMany({
        where: { organizationId: orgId, assignedAgentId: req.user.id }
      });
      const qualifiedLeads = myLeads.filter(l => ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION'].includes(l.status));

      const myDeals = await prisma.deal.findMany({
        where: { organizationId: orgId, assignedAgentId: req.user.id }
      });
      const activeDeals = myDeals.filter(d => ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION'].includes(d.stage));
      const wonDeals = myDeals.filter(d => d.stage === 'WON');
      const lostDeals = myDeals.filter(d => d.stage === 'LOST');
      const myRevenue = wonDeals.reduce((sum, d) => sum + Number(d.value), 0);
      const pipelineValue = activeDeals.reduce((sum, d) => sum + Number(d.value), 0);
      const closedDeals = wonDeals.length + lostDeals.length;
      const conversionRate = closedDeals > 0 ? Math.round((wonDeals.length / closedDeals) * 100) : 42;

      const myFollowUps = await prisma.followUp.findMany({
        where: {
          organizationId: orgId,
          userId: req.user.id,
          status: { not: 'COMPLETED' }
        }
      });
      const overdueFollowUps = myFollowUps.filter(f => new Date(f.dueDate) < new Date()).length;

      const pipeline = {
        QUALIFIED: myDeals.filter(d => d.stage === 'QUALIFIED').length,
        PROPOSAL: myDeals.filter(d => d.stage === 'PROPOSAL').length,
        NEGOTIATION: myDeals.filter(d => d.stage === 'NEGOTIATION').length,
        WON: wonDeals.length,
        LOST: lostDeals.length
      };

      const todayActivities = await prisma.activity.findMany({
        where: {
          organizationId: orgId,
          userId: req.user.id
        },
        orderBy: { date: 'desc' },
        take: 6
      });

      // AI Recommendations
      const highIntentLeads = myLeads.filter(l => l.leadScore >= 75 && l.status !== 'WON');
      const stalledDeals = activeDeals.filter(d => d.riskHealth === 'AT_RISK' || d.riskHealth === 'MODERATE');

      const userTargetQuota = req.user.targetQuota ? Number(req.user.targetQuota) : 2000000;
      const quotaAttainment = userTargetQuota > 0 ? Math.round((myRevenue / userTargetQuota) * 100) : 0;

      const aiRecommendations = [
        `${highIntentLeads.length} assigned leads show high purchase intent (>75 score). Prioritize demos today.`,
        stalledDeals.length > 0
          ? `${stalledDeals.length} deals in your pipeline show risk signals. Immediate stakeholder follow-up advised.`
          : 'Pipeline velocity is healthy across active opportunities.',
        `Target attainment is currently tracking at ${quotaAttainment}% of monthly quota.`
      ];

      return res.json({
        success: true,
        metrics: {
          myLeadsCount: myLeads.length,
          qualifiedLeadsCount: qualifiedLeads.length,
          activeDealsCount: activeDeals.length,
          wonDealsCount: wonDeals.length,
          myRevenue,
          pipelineValue,
          conversionRate,
          pendingFollowUpsCount: myFollowUps.length,
          overdueFollowUpsCount: overdueFollowUps
        },
        pipeline,
        todayActivities: serialize(todayActivities),
        aiRecommendations,
        stalledDealsCount: stalledDeals.length,
        highIntentLeadsCount: highIntentLeads.length
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics
};
