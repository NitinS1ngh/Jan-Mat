// Standalone script: populates Top 5 using mock AI analysis
require('dotenv').config();
const mongoose = require('mongoose');
const Proposal = require('./models/Proposal');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Reset any previous analysis
  await Proposal.updateMany({ status: 'Top5' }, { status: 'Active', timelineStage: 'Community Voting' });
  await Proposal.updateMany({ status: 'Needs Revision' }, { status: 'Active', timelineStage: 'Community Voting' });

  // Pick top proposals by upvotes
  const all = await Proposal.find({ status: 'Active' }).sort({ upvoteCount: -1 }).limit(30);

  const top5 = all.slice(0, 5);
  const needsRevision = all.slice(25, 30); // bottom 5 by upvotes get flagged for demo

  const whyItMatters = [
    'This proposal addresses a critical gap that affects hundreds of millions of citizens daily. Independent research confirms that implementation would measurably improve quality of life within 2 years and reduce inequality by establishing equal access to fundamental services.',
    'Citizens across every demographic and income bracket benefit from this policy. Evidence from comparable democracies shows 20-30% improvement in trust in public institutions when similar policies are enacted, with long-term economic multipliers above 1.7x.',
    'The proposal targets a systemic failure that has persisted for decades. With proper implementation, it directly empowers the most vulnerable sections of society while creating a path to self-reliance and reduced dependence on government support.',
    'This directly tackles one of the top 3 issues cited by citizens in national surveys. The policy has cross-party legislative support in principle and aligns with constitutional obligations already upheld by the Supreme Court in related judgments.',
    'Endorsed by independent economists, legal scholars, and civil society organisations. The proposal creates sustainable change rather than short-term relief, with a fiscal cost that is recoverable within 5 years through increased productivity and reduced crisis expenditure.',
  ];

  const constitutionalAnalysis = [
    'Fully compliant with the Indian Constitution. Operates within Parliament\'s legislative competence under the Union List. Upholds Article 14 (equality), Article 19 (freedom), and Article 21 (life and dignity). No Fundamental Right is infringed and the Basic Structure Doctrine is preserved.',
    'This proposal strengthens, rather than weakens, constitutional rights. It advances the Directive Principles under Part IV (Articles 38, 39, 41, 43) which the Supreme Court has held must be read harmoniously with Fundamental Rights. The legislation would withstand constitutional scrutiny.',
    'Constitutional analysis confirms compliance with all seven Basic Structure elements. The proposal uses existing legislative machinery and does not require a constitutional amendment. It is consistent with multiple Supreme Court precedents on the scope of Article 21 (right to livelihood and dignity).',
    'The proposal falls squarely within the Union List and is consistent with treaty obligations India has ratified. It advances social justice without creating any classification that would violate Article 14\'s guarantee of equal protection before law. Courts have repeatedly upheld similar legislation.',
    'Independent constitutional review confirms this proposal is legally sound. It builds on legislation that has already been upheld as valid by the Supreme Court. The Right to Equality under Article 14 and Right to Life under Article 21 are both strengthened, not compromised.',
  ];

  const sentimentSummaries = [
    'Public sentiment is strongly positive across all age groups and geographic regions. Social listening data shows constructive, issue-focused discourse with wide cross-party support. The proposal has garnered coverage in major national publications as a priority reform.',
    'Broad consensus across civil society, professional associations, and academic institutions. Online discourse is optimistic and solution-oriented. Comparable international policies have generated positive citizen satisfaction scores above 70% within 18 months of implementation.',
    'Citizens express strong moral urgency around this issue. Comments and debates show high emotional investment with constructive framing. The proposal has viral traction among 25-40 age demographic who identify it as a generational priority for India\'s development trajectory.',
    'Sentiment is overwhelmingly supportive with nuanced debate on implementation mechanisms rather than the principle itself. Experts broadly endorse the direction. Media coverage has been factual and balanced, reflecting mature public discourse on a complex but vital issue.',
    'Strong grassroots support with organised advocacy from professional bodies and NGOs. The proposal bridges ideological divides — support cuts across income levels, regions, and political affiliations. Citizen forums show high-quality deliberation on the policy details.',
  ];

  console.log('\n=== TOP 5 PEOPLES CHOICE PROPOSALS ===\n');

  for (let i = 0; i < top5.length; i++) {
    const p = top5[i];
    const constitutionalScore = 95 - i * 2;
    const impactScore = 92 - i * 3;

    await Proposal.findByIdAndUpdate(p._id, {
      status: 'Top5',
      timelineStage: 'AI Constitutional Check',
      whyItMatters: whyItMatters[i],
      constitutionalScore,
      constitutionalAnalysis: constitutionalAnalysis[i],
      impactScore,
      sentimentSummary: sentimentSummaries[i],
      analysedAt: new Date(),
    });

    console.log(`${i + 1}. [${p.category}] ${p.title}`);
    console.log(`   Constitutional Score: ${constitutionalScore}/100 | Impact Score: ${impactScore}/100 | Upvotes: ${p.upvoteCount}`);
    console.log();
  }

  console.log('=== FLAGGED FOR REVISION ===\n');
  for (const p of needsRevision) {
    await Proposal.findByIdAndUpdate(p._id, {
      status: 'Needs Revision',
      aiSummary: 'This proposal requires constitutional revision. The current drafting may conflict with Article 14 (Right to Equality) by creating classifications without a demonstrable rational nexus. The author is advised to revise to ensure uniform applicability and submit for re-analysis.',
      analysedAt: new Date(),
    });
    console.log(`- [${p.category}] ${p.title}`);
  }

  console.log('\n✅ Mock AI analysis complete. Top 5 populated in database.');
  await mongoose.disconnect();
}

run().catch(err => { console.error('Error:', err.message); process.exit(1); });
