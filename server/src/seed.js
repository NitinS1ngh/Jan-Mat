require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Proposal = require("./models/Proposal");
const Comment = require("./models/Comment");

// 3 proposals per category × 10 categories = 30 proposals
const proposals = [
  // ── HEALTH (3) ──────────────────────────────────────────────────────
  {
    title: "Universal Free Healthcare for All Citizens Below Poverty Line",
    category: "Health",
    description: "Every Indian citizen living below the poverty line should receive completely free primary and secondary healthcare services including doctor consultations, medicines, diagnostics, and hospitalisation. The scheme should be cashless and paperless, linked to Aadhaar for eligibility verification. Implementation through Ayushman Bharat expansion with an enhanced annual budget of 80,000 crore rupees. All empanelled government and private hospitals must mandatorily admit BPL patients. A dedicated Health Ombudsman in every district handles grievances within 15 days. Current Ayushman Bharat covers 5 lakh rupees per year per family but excludes OPD consultations and medicines. This proposal closes that critical gap and ensures no Indian dies or goes into debt due to lack of healthcare access.",
    upvoteCount: 6200,
  },
  {
    title: "Mental Health Integration into Primary Healthcare Centers",
    category: "Health",
    description: "Mental health care must be integrated into every Primary Health Center (PHC) across India. Currently fewer than 1% of PHCs have any mental health professional. This proposal mandates posting of at least one trained clinical psychologist or counsellor at every PHC, and at least one psychiatrist at every Community Health Center (CHC). Tele-mental health services through the eSanjeevani platform extended to all districts. School counsellors mandatory in all government schools above 200 students. Mental health days to be recognised as valid sick leave under all labour laws. Stigma reduction awareness campaigns funded at 2,000 crore rupees annually. India has over 150 million people needing mental health care but only 9,000 psychiatrists nationwide.",
    upvoteCount: 4500,
  },
  {
    title: "National Preventive Health Screening Programme for Non-Communicable Diseases",
    category: "Health",
    description: "Non-communicable diseases including diabetes, hypertension, cancer, and cardiovascular disease account for 63% of deaths in India yet most are detected too late. This proposal mandates annual free health screening camps at ward level in urban areas and at gram panchayat level in rural areas. All citizens above 35 should receive annual blood pressure, blood sugar, BMI, and basic cancer screening tests free of cost. Mobile health vans to reach remote areas. Early detection reduces treatment costs by 60-70% and saves lives. Data linked to a National Health Registry for epidemiological tracking. A Preventive Health Score for each citizen updated annually. Estimated cost of 18,000 crore rupees annually with 10 times return in productivity and reduced healthcare expenditure.",
    upvoteCount: 3800,
  },

  // ── TECHNOLOGY (3) ─────────────────────────────────────────────────
  {
    title: "Universal Broadband Internet as a Constitutional Right",
    category: "Technology",
    description: "High-speed broadband internet of minimum 25 Mbps must be declared a basic constitutional entitlement under the expanded interpretation of Article 21. Currently 700 million Indians lack reliable internet access. The government through BSNL and universal service obligations must ensure coverage in every village by 2027. BPL households to receive free basic internet of 5 GB per month funded through the Universal Service Obligation Fund. All gram panchayat offices to have high-speed WiFi hotspots. Internet access is now essential for education, healthcare, banking, and employment. Without it citizens are excluded from the digital economy and public services. This proposal treats broadband like electricity and water.",
    upvoteCount: 5100,
  },
  {
    title: "National Artificial Intelligence Ethics and Regulation Framework",
    category: "Technology",
    description: "India needs a comprehensive AI regulation law to govern the development and deployment of AI systems across sectors. The framework establishes a National AI Regulatory Authority that classifies AI by risk: prohibited AI includes autonomous lethal weapons and social scoring; high-risk AI in health, judiciary, credit, and recruitment requires mandatory auditing, explainability, and human oversight; medium-risk AI requires registration; low-risk AI is self-regulated. Biometric surveillance in public spaces requires judicial approval. AI-generated content must be labelled. Companies deploying high-risk AI must maintain audit trails for 5 years. Penalties up to 500 crore rupees for violation. Citizens have the right to know when AI is making decisions affecting them and to challenge those decisions.",
    upvoteCount: 4300,
  },
  {
    title: "Mandatory Open Source Government Software Policy",
    category: "Technology",
    description: "All software developed using public funds for government use must be released as open source within 2 years of deployment. This prevents vendor lock-in that currently costs the government an estimated 25,000 crore rupees annually in proprietary software licenses. A Government Open Source Repository would host all publicly funded software. Private vendors working on government contracts must assign IP rights to the government. This enables independent security audits, reduces costs, and allows state governments to reuse central government software. Countries like France, Germany, and Spain have successfully implemented similar policies. India's Digital Public Infrastructure including Aadhaar, UPI, and DIKSHA already demonstrates the power of open-source public technology.",
    upvoteCount: 3200,
  },

  // ── EDUCATION (3) ──────────────────────────────────────────────────
  {
    title: "Free Quality Education from Kindergarten to Class 12 in All Government Schools",
    category: "Education",
    description: "The Right to Education Act guarantees free education up to Class 8. This proposal extends it to Class 12. All government schools must provide free education, free textbooks, free uniforms, free noon meals, and free transportation within 5 km. The Central government must increase education spending from 3% to 6% of GDP as recommended by every education commission since 1964. Teacher vacancies across the country standing at over 10 lakh must be filled within 2 years. No private school to receive government land subsidy without reserving 50% seats at government rates. Quality benchmarks tied to government funding with third-party assessments annually. Education is the single highest-return public investment and this proposal ensures no child is denied it due to poverty.",
    upvoteCount: 5800,
  },
  {
    title: "Vocational Training and Apprenticeship Rights for Every Youth",
    category: "Education",
    description: "Every citizen between the ages of 16 and 30 should have the right to access at least one government-funded vocational training programme. The National Apprenticeship Promotion Scheme must be strengthened with mandatory participation by companies above 50 employees, who must employ at least 5% apprentices. Stipends of at least 10,000 rupees per month for apprentices. ITIs to be upgraded with modern equipment funded by a 2,000 crore rupee annual fund. A National Skills Passport recognising all certifications digitally. Currently only 5% of Indian youth receive any formal vocational training compared to 70% in Germany and 80% in South Korea. Bridging this gap is essential for India to leverage its demographic dividend before 2040.",
    upvoteCount: 4100,
  },
  {
    title: "Mandatory Financial Literacy in School Curriculum from Class 8",
    category: "Education",
    description: "Financial literacy including income tax filing, budget management, savings, investments, insurance, loans, and pension planning must be a compulsory subject in all schools from Class 8. Only 27% of Indians are financially literate which leads to widespread debt traps, insurance fraud, and poor retirement planning. Curriculum to be developed by NCERT in collaboration with SEBI, RBI, and IRDA. Teachers to receive dedicated training with certification. Digital modules available free on DIKSHA. Practical exercises include managing mock bank accounts, filing sample ITRs, and constructing a personal budget. Students completing the course receive a Financial Literacy Certificate. This builds the financial self-reliance of 250 million school students over the next decade.",
    upvoteCount: 3600,
  },

  // ── ENVIRONMENT (3) ──────────────────────────────────────────────────
  {
    title: "Zero Single-Use Plastic by 2027 with Full Industry Support Fund",
    category: "Environment",
    description: "India must achieve complete elimination of all single-use plastics below 120 microns by 2027. A Biodegradable Transition Fund of 15,000 crore rupees will provide capital subsidies to manufacturers switching to eco-friendly alternatives including jute, paper, and banana-leaf products. Retailers caught distributing banned plastics face penalties of 1 lakh rupees for first offense and 5 lakh for repeat offense. Extended Producer Responsibility mandated for all packaging above 10 tonnes annual production. India generates 3.5 million tonnes of plastic waste annually of which only 30% is recycled. This proposal accelerates transition while protecting the 40,000 plastic industry workers through retraining and redeployment programmes.",
    upvoteCount: 4700,
  },
  {
    title: "Polluter Pays Law: Industries Must Fund Full Environmental Restoration",
    category: "Environment",
    description: "Any industry or entity causing measurable environmental pollution including air, water, or soil contamination must bear the full cost of restoration to pre-pollution baseline levels. A National Environment Liability Registry tracks all polluters and their restoration obligations. Restoration timelines enforced by the National Green Tribunal with contempt powers. Industries must post an Environment Performance Bond equivalent to 2% of annual revenues as insurance against pollution liabilities. Whistleblowers reporting pollution receive 10% of penalty recovered. Currently India loses 8.5% of GDP annually to environmental degradation. The Supreme Court has upheld the polluter-pays principle in multiple judgments. This legislation gives it teeth with automatic enforcement triggers.",
    upvoteCount: 4100,
  },
  {
    title: "National Renewable Energy Mission: 80% Clean Energy by 2035",
    category: "Environment",
    description: "India must amend its energy policy to legally mandate 80% of electricity generation from renewable sources including solar, wind, and hydro by 2035. Current target of 500 GW renewables by 2030 needs stronger legislative backing. All new residential buildings above 200 square meters must have mandatory rooftop solar. Industrial consumers above 1 MW must source 40% from renewables by 2030. A Green Energy Transition Fund of 2 lakh crore rupees supports state utilities in retiring coal plants and retaining coal workers through retraining. Coal plant phaseout timeline legally fixed at 2040. This positions India as the world renewable energy leader and reduces import dependence on fossil fuels while creating 3 million green jobs.",
    upvoteCount: 3900,
  },

  // ── ECONOMY (3) ──────────────────────────────────────────────────────
  {
    title: "Transparent Government Spending Portal: Every Rupee Traceable Online",
    category: "Economy",
    description: "Every rupee of government expenditure at central, state, and local body levels must be publicly accessible on a unified Open Government Finance Portal within 2 years. All contracts above 10 lakh rupees to be published before award with vendor details, justification, and contract value. Real-time payment tracking from treasury to beneficiary using PFMS integration. Citizens can flag suspicious transactions through a public audit interface with guaranteed 60-day response from the CAG. Every MP and MLA constituency fund expenditure to be individually tracked and published quarterly. Currently India loses an estimated 3 lakh crore rupees annually to public procurement corruption. Full financial transparency is the most cost-effective anti-corruption tool available.",
    upvoteCount: 5400,
  },
  {
    title: "Startup India 2.0: 5-Year Tax Holiday and Single-Window Registration",
    category: "Economy",
    description: "Early-stage startups registered with DPIIT with revenue under 10 crore rupees should receive a 5-year income tax holiday, zero compliance burden for the first 2 years, and streamlined single-window registration completing in 24 hours online. A National Startup Credit Guarantee Fund provides collateral-free loans up to 50 lakh rupees at 6% interest. Government procurement must reserve 25% of contracts under 5 crore rupees for startups. Startup employees to receive ESOPs with simpler tax treatment. IP registration fees waived. India has 100,000 startups but 90% fail in the first 5 years mostly due to regulatory burden and funding gaps rather than product failure. This proposal creates the regulatory environment needed for India to build the next generation of global tech companies.",
    upvoteCount: 4200,
  },
  {
    title: "Mandatory Work-Life Balance Law: 48-Hour Cap and Right to Disconnect",
    category: "Economy",
    description: "Indian labour law must explicitly cap total working hours at 48 hours per week for all employees across formal and informal sectors. The Right to Disconnect giving employees the legal right to not respond to employer communications outside working hours must be legally protected similar to France, Portugal, and Belgium. Minimum 15 days paid annual leave mandatory for all employees including contractual workers. Dual compensation at 2 times the hourly rate mandatory for overtime beyond 48 hours. Gig workers to receive proportional benefits including paid leave. Companies must publish annual workforce wellness reports from 2026. India loses an estimated 1.8 lakh crore rupees annually in productivity and 14 lakh crore in healthcare costs linked to overwork. Better work-life balance increases long-term productivity by 21% according to global studies.",
    upvoteCount: 3700,
  },

  // ── INFRASTRUCTURE (3) ──────────────────────────────────────────────
  {
    title: "Public Transport First: 60% Road Space for Buses, Cyclists, and Pedestrians",
    category: "Infrastructure",
    description: "All Indian cities with populations above 5 lakh must legally allocate a minimum of 60% of road space to public transport, dedicated cycling lanes, and pedestrian footpaths. Private vehicle lanes cannot be expanded without proportional expansion of public transport capacity. All cities must develop 5-year Comprehensive Urban Mobility Plans approved by a National Urban Transport Authority. Bus Rapid Transit corridors mandatory for cities above 10 lakh population. City buses must be electric by 2030. Monthly transit passes capped at 500 rupees for commuters. Delhi, Mumbai, and Bengaluru each lose over 20,000 crore rupees annually to traffic congestion. Prioritising public transport reduces emissions, congestion, commute costs for 80% of urban commuters who already use it, and improves air quality.",
    upvoteCount: 3800,
  },
  {
    title: "Affordable Housing Guarantee: Eliminate Houselessness by 2030",
    category: "Infrastructure",
    description: "The government must guarantee that every Indian family has access to safe and affordable permanent shelter by 2030. Implementation through: Mandatory Inclusionary Zoning requiring every new residential project above 50 units to reserve 20% as affordable housing; A National Housing Loan Guarantee Fund providing 4% interest home loans for first-time buyers earning under 5 lakh rupees annually; Slum redevelopment with in-situ rehabilitation as the default model rather than displacement; Urban land reform releasing government-held vacant land through transparent public auction with 50% reserved for affordable housing. Currently 4 crore families are homeless or in unsafe housing. PMAY has built 3 crore homes but targeting and quality gaps remain. This proposal closes those structural gaps.",
    upvoteCount: 4100,
  },
  {
    title: "High-Speed Rail Connectivity for Tier 2 and Tier 3 Cities",
    category: "Infrastructure",
    description: "India must build a dedicated High-Speed Rail network at 160-200 km/h connecting 100 Tier 2 and Tier 3 cities that are currently underserved by Indian Railways. Phase 1 to cover 20 city pairs including Coimbatore-Madurai, Patna-Muzaffarpur, Bhopal-Indore, Nashik-Aurangabad, and Visakhapatnam-Vijayawada by 2030. PPP model with 60% government funding. HSR stations designed as economic development hubs with FDI-ready industrial clusters. Decongest metros by redistributing economic activity to Tier 2 cities. Rail travel reduces per-passenger carbon emissions by 70% compared to air travel. Estimated investment of 3.5 lakh crore rupees over 10 years with projected economic multiplier of 1.8x through regional development and employment generation.",
    upvoteCount: 3500,
  },

  // ── SOCIAL JUSTICE (3) ──────────────────────────────────────────────
  {
    title: "Transparent Political Funding: Replace Electoral Bonds with Full Disclosure",
    category: "Social Justice",
    description: "All donations to political parties above 1,000 rupees must be fully transparent with donor name, amount, and date published in real time on the Election Commission website. The Electoral Bond scheme must be permanently abolished following the Supreme Court ruling. Corporate donations capped at 7.5% of average net profits over 3 years. Anonymous donations capped at 500 rupees per donor. A Political Finance Oversight Authority with independent powers created under the Election Commission. Violation by parties leads to deregistration and loss of public funding. Democratic integrity requires that citizens know who funds the parties governing them. Political funding opacity directly enables regulatory capture, policy distortion, and corruption.",
    upvoteCount: 5200,
  },
  {
    title: "Merit-Based Government Recruitment with Zero-Tolerance Exam Paper Leak Policy",
    category: "Social Justice",
    description: "All government recruitment must use a standardised, transparent merit-based system with zero tolerance for paper leaks. An independent National Recruitment Integrity Commission with investigative and prosecution powers must oversee all public examinations conducted by UPSC, SSC, state PSCs, and railway boards. Comprehensive CCTV surveillance of all examination centres. Results, answer keys, and model solutions to be published within 24 hours. Any paper leak triggers automatic reexamination within 90 days at government expense. Officials found complicit face 7 years imprisonment. Candidates who reported the leak receive protected witness status. India documented 35 major paper leaks between 2018 and 2023, depriving lakhs of deserving candidates of their rightful opportunities.",
    upvoteCount: 5100,
  },
  {
    title: "Gender Pay Equity Act: Equal Pay for Equal Work Made Enforceable",
    category: "Social Justice",
    description: "India already has the Equal Remuneration Act of 1976 but it remains poorly enforced. This proposal strengthens it with mandatory annual pay equity audits for all companies with over 100 employees, published results, and penalties of 5 lakh rupees per violation per employee. Companies must achieve pay equity within 3 years or face public procurement disqualification. A Pay Transparency Portal for all PSU and government employees. Women in India earn on average 19% less than men for equivalent work. This gender pay gap costs the economy 18 lakh crore rupees annually in lost productivity. Companies that close their gender pay gap report 15% higher employee retention and 8% higher productivity. Pay equity is both a fundamental rights issue under Article 14 and an economic imperative.",
    upvoteCount: 4600,
  },

  // ── AGRICULTURE (3) ──────────────────────────────────────────────────
  {
    title: "Legal Guarantee of Minimum Support Price for 25 Essential Crops",
    category: "Agriculture",
    description: "The Minimum Support Price for 25 essential agricultural crops must be given legal backing through an amendment to the Essential Commodities Act. All buyers including traders, processors, and corporations must pay at least the officially declared MSP. A National MSP Compliance Authority with district-level officers will monitor procurement. Violations attract penalties of 3 times the price shortfall. Farmers can report violations through a mobile app with guaranteed response within 7 days. Currently MSP is declared but not legally enforceable leaving farmers at the mercy of market forces. 140 million farm households depend on agricultural income. Cost of production calculations by the CACP must include family labour and land rent to reflect actual farmer costs. This directly addresses farmer debt distress.",
    upvoteCount: 5600,
  },
  {
    title: "PM Crop Insurance Reform: 100% Claims Settlement Within 30 Days",
    category: "Agriculture",
    description: "The Pradhan Mantri Fasal Bima Yojana must be reformed to guarantee 100% claim settlement within 30 days of harvest loss. Currently average claim settlement takes 6-9 months while farmers need money immediately after crop loss. Satellite and drone-based crop assessment to replace subjective physical assessment which is prone to underpayment. Insurance companies failing the 30-day settlement mandate to pay 18% interest. Compulsory coverage for all farmers receiving Kisan Credit Cards. Premium for small and marginal farmers fully subsidised by the government. Insurance products to cover not just rainfall deficit but also pest damage, flood, and excessive rain. Currently only 30% of enrolled farmers ever receive claims. This reform transforms crop insurance from a subsidy leak to genuine farmer protection.",
    upvoteCount: 4900,
  },
  {
    title: "Farmer Digital Platform: Direct Market Access Eliminating Middlemen",
    category: "Agriculture",
    description: "A National Farmer Digital Market Platform must connect farmers directly with retail chains, restaurants, exporters, and consumers without mandatory intermediaries. Farmers receive 70-85% of consumer price compared to current 25-40% through traditional APMC mandis. The platform enables forward contracts, crop price discovery, logistical support matching, and cold chain access. Mandatory integration with all government procurement agencies. Cold chain infrastructure grant scheme of 10,000 crore rupees for farmer producer organisations to build processing and storage. The National Agriculture Market (eNAM) exists but covers only 1,260 mandis. This proposal builds a comprehensive farm-to-fork digital infrastructure covering every block in India and ending the 40-60% post-harvest food loss driven by lack of market access.",
    upvoteCount: 4200,
  },

  // ── DEFENCE (3) ──────────────────────────────────────────────────────
  {
    title: "Veteran Healthcare Guarantee: Free Lifetime Medical Care for Armed Forces Personnel",
    category: "Defence",
    description: "Every serving and retired member of the Indian Armed Forces and their immediate family must receive free, comprehensive healthcare including specialised treatments, prosthetics, and mental health services for life. The ECHS (Ex-Servicemen Contributory Health Scheme) must be converted to a fully government-funded entitlement without contribution requirements. Currently 25 lakh veterans and their families pay premiums for ECHS and still face denial of claims. ECHS coverage to be extended to all empanelled private hospitals without geographic restrictions. A dedicated Armed Forces Cancer and Critical Care Centre to be established at each Command headquarters. Soldier mental health including PTSD treatment to be fully covered without stigma. Those who risk their lives for the nation deserve guaranteed healthcare for life.",
    upvoteCount: 4800,
  },
  {
    title: "Defence Research Fund: 10,000 Crore Annual Investment in Indigenous Technology",
    category: "Defence",
    description: "India spends 60% of its defence capital budget importing equipment. This must be reduced to 30% by 2030 through a dedicated Defence Innovation and Research Fund of 10,000 crore rupees annually for domestic firms including MSMEs and startups. DRDO to open 30% of its technology transfer licences to private sector free of royalties for 5 years. iDEX (Innovations for Defence Excellence) to be expanded with 500 crore rupee annual budget for startup defence technology challenges. Mandatory offsets of 30% on all defence imports above 500 crore rupees to fund domestic R&D. Universities to establish joint defence research centres with DRDO funding. Defence indigenisation creates high-value employment, reduces foreign exchange outflow, and builds strategic self-reliance under the Atmanirbhar Bharat vision.",
    upvoteCount: 3600,
  },
  {
    title: "Cyber Defence National Shield: Protect Critical National Infrastructure",
    category: "Defence",
    description: "India must create a National Cyber Defence Command with dedicated authority to protect critical infrastructure including power grids, financial systems, healthcare networks, railways, and telecom from state-sponsored and criminal cyber attacks. A Cyber Emergency Response Force capable of 24/7 active defence must be established with 5,000 specialist personnel. All critical infrastructure operators must meet mandatory cybersecurity standards and conduct quarterly penetration testing audited by the National Cyber Security Agency. Budget of 8,000 crore rupees annually. India faces over 50,000 cyber attacks daily on government systems. The 2021 attack on Mumbai power grid and the AIIMS ransomware attack in 2022 demonstrated the catastrophic potential of undefended critical infrastructure. Cyber defence is now as important as physical defence.",
    upvoteCount: 3900,
  },

  // ── OTHER (3) ──────────────────────────────────────────────────────────
  {
    title: "National Innovation Challenge: Youth Solving Real National Problems",
    category: "Other",
    description: "A permanent National Innovation Challenge (NIC) must be institutionalised to engage students from Class 9 through postgraduate level in solving real government-identified problems across 10 sectors annually. Winners at district, state, and national levels receive grants from 1 lakh to 5 crore rupees, mentorship from IIT and IISc faculty, and 5-year patent protection. Government agencies must consider winning solutions for procurement under a Fast Track Procurement path. All submissions licensed open-source so the government can adapt any idea for public benefit. 50 problems to be published on the NIC Portal annually drawn from on-ground challenges reported by district collectors. This institutionalises grassroots innovation, connects youth with national purpose, and creates a community problem-solving culture.",
    upvoteCount: 3400,
  },
  {
    title: "Right to Information 2.0: Proactive Disclosure of All Public Data",
    category: "Other",
    description: "The Right to Information Act must be upgraded to require proactive real-time disclosure of all non-sensitive government data without requiring a citizen application. All policy documents, file notings, cabinet decisions, contract awards, and regulatory orders to be published online within 48 hours. RTI response time to be reduced from 30 days to 10 days for personal information and 15 days for public interest matters. Information Commissioners to have permanent tenure protected from government interference. RTI applicants to receive compensation for delayed responses at 250 rupees per day. RTI amendments weakening the independence of information commissioners to be reversed. Proactive disclosure eliminates 80% of RTI applications reducing administrative burden while increasing transparency. Democracy requires informed citizens.",
    upvoteCount: 4300,
  },
  {
    title: "Uniform Civil Code: A Gender-Just Modern Family Law for All Indians",
    category: "Other",
    description: "India needs a modern, gender-neutral, and constitutionally grounded Uniform Civil Code governing marriage, divorce, inheritance, adoption, and guardianship uniformly for all citizens regardless of religion. The code must be rights-based, not scripture-based, and fully consistent with Articles 14, 15, and 21 of the Constitution. It should guarantee equal inheritance rights for daughters, equal divorce rights for spouses, equal custody rights, and eliminate child marriage for all communities. A Law Commission must draft the UCC through a 2-year public consultation process with representation from all religious and regional communities. Goa already has a functioning Civil Code since 1867 proving feasibility. The UCC does not infringe religious freedom as Article 25 guarantees religious practice, not religious discrimination in civil law.",
    upvoteCount: 2800,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await User.deleteMany({});
    await Proposal.deleteMany({});
    await Comment.deleteMany({});

    await User.create({
      name: "Parliamentary Observer",
      email: "admin@janmat.gov.in",
      password: "Admin@123",
      role: "admin",
      aadhaarVerified: true,
    });

    const citizens = await User.insertMany([
      { name: "Priya Sharma",   email: "priya@example.com",   password: "Citizen@123", aadhaarVerified: true  },
      { name: "Rahul Gupta",    email: "rahul@example.com",   password: "Citizen@123", aadhaarVerified: false },
      { name: "Anjali Mehta",   email: "anjali@example.com",  password: "Citizen@123", aadhaarVerified: true  },
      { name: "Arjun Nair",     email: "arjun@example.com",   password: "Citizen@123", aadhaarVerified: true  },
      { name: "Fatima Khan",    email: "fatima@example.com",  password: "Citizen@123", aadhaarVerified: false },
      { name: "Vikram Singh",   email: "vikram@example.com",  password: "Citizen@123", aadhaarVerified: true  },
      { name: "Meera Pillai",   email: "meera@example.com",   password: "Citizen@123", aadhaarVerified: true  },
    ]);

    const created = [];
    for (let i = 0; i < proposals.length; i++) {
      const p = await Proposal.create({
        ...proposals[i],
        author: citizens[i % citizens.length]._id,
        timelineStage: "Community Voting",
        status: "Active",
      });
      created.push(p);
    }

    const commentBodies = [
      "This is exactly what India needs right now. Fully support this proposal.",
      "Well thought out. The constitutional grounding makes it particularly strong.",
      "I agree with the intent but the implementation timeline needs reconsideration.",
      "Would love to see a pilot programme in one state before national rollout.",
      "Finally someone is talking about this issue seriously. Strong upvote.",
      "The funding mechanism is sound. This can actually work within our fiscal limits.",
      "This addresses the root cause, not just the symptoms. Excellent proposal.",
      "Need more details on enforcement mechanisms, but the direction is right.",
    ];

    for (let i = 0; i < 20; i++) {
      await Comment.create({
        proposal: created[i % created.length]._id,
        author: citizens[(i + 2) % citizens.length]._id,
        body: commentBodies[i % commentBodies.length],
      });
    }

    const categories = {};
    created.forEach(p => { categories[p.category] = (categories[p.category] || 0) + 1; });
    console.log(`\u2705 Seeded ${created.length} proposals across ${Object.keys(categories).length} categories:`);
    Object.entries(categories).sort().forEach(([cat, count]) => console.log(`   ${cat}: ${count} proposals`));

    await mongoose.disconnect();
  } catch (err) {
    console.error("\u274C Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();
