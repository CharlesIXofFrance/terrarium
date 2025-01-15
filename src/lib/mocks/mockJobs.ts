import type { Job } from '../types/jobs';

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Investment Banking Analyst',
    company: 'Goldman Sachs',
    companyLogo:
      'https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg',
    coverImage:
      'https://images.unsplash.com/photo-1573496774426-fe3db3dd1731?q=80&w=3869&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // C1
    location: 'London',
    type: 'Full-Time',
    salary: {
      min: 70000,
      max: 85000,
      currency: 'EUR',
    },
    experience: '2-4 Years',
    description: `Join our Investment Banking Division focused on technology and innovation sectors. As an Investment Banking Analyst at Goldman Sachs, you will be immersed in high-profile M&A transactions, IPOs, and strategic advisory assignments.

- **Conduct financial analysis and modeling** to support deal execution.
- **Prepare pitch books and presentation materials** for client meetings.
- **Perform industry and company-specific research** to identify trends and opportunities.
- **Collaborate with senior bankers** to develop strategic solutions for clients.`,
    requirements: [
      "**Bachelor's degree** in Finance, Economics, or related field",
      '**Previous investment banking internship** experience',
      '**Strong financial modeling and valuation skills**',
      '**Excellent analytical and problem-solving abilities**',
    ],
    roleBenefits: [
      '**Exposure to top-tier clients** and complex financial transactions.',
      '**Comprehensive training programs** to accelerate your professional growth.',
      '**A dynamic and inclusive work environment** that fosters innovation and teamwork.',
    ],
    status: 'active',
    postedAt: new Date().toISOString(),
    communityId: 'women-in-fintech',
    isEarlyApplicant: true,
    sisterScore: 85,
    benefits: [
      {
        icon: 'health',
        label: 'Comprehensive Health Insurance',
        description: 'Full medical, dental, and vision coverage',
      },
      {
        icon: 'bonus',
        label: 'Performance Bonus',
        description: 'Competitive annual bonus structure',
      },
      {
        icon: 'education',
        label: 'Learning Budget',
        description: '£5,000 annual education allowance',
      },
      {
        icon: 'fitness',
        label: 'Wellness Program',
        description: 'Gym membership and wellness activities',
      },
    ],
    companyInsights: {
      founded: 1869,
      size: '10000+',
      funding: 'Public',
      industry: 'Investment Banking',
      genderDiversity: {
        male: 55,
        female: 45,
      },
      description:
        'Leading global investment banking, securities and investment management firm with a rich history of innovation and market leadership.',
      teamPhoto: {
        url: 'https://images.unsplash.com/photo-1550071593-fd1bdaf1f93c?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // U1
        alt: 'Goldman Sachs team collaboration',
      },
      locations: [
        { name: 'London', coordinates: [51.5074, -0.1278] },
        { name: 'New York', coordinates: [40.7128, -74.006] },
        { name: 'Hong Kong', coordinates: [22.3193, 114.1694] },
      ],
      employeeGrowth: {
        percentage: 12,
        period: 'last 12 months',
      },
      awards: [
        { title: 'Best Investment Bank 2023', year: '2023' },
        { title: 'Top Employer for Women in Finance', year: '2023' },
        { title: 'Innovation in Digital Banking', year: '2022' },
      ],
      transparency: {
        responseTime: '48 hours',
        growthRate: '12%',
        rating: 4.5,
      },
    },
    workingPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1653762379480-f647e6228dc6?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // E1
        caption: 'Team collaboration in our modern office space',
        category: 'collaboration',
        size: 'large',
      },
      {
        url: 'https://images.unsplash.com/photo-1560439450-57df7ac6dbef?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // E5
        caption: 'Weekly team meetings and knowledge sharing',
        category: 'collaboration',
        size: 'small',
      },
      {
        url: 'https://images.unsplash.com/photo-1628336707631-68131ca720c3?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // E2
        caption: 'Celebrating team achievements',
        category: 'culture',
        size: 'small',
      },
      {
        url: 'https://images.unsplash.com/photo-1557804500-7a58fbcd4d1a?q=80&w=3774&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // O1
        caption: 'Our open workspace environment',
        category: 'office',
        size: 'medium',
      },
    ],
  },
  {
    id: '2',
    title: 'FinTech Product Manager',
    company: 'Adyen',
    companyLogo:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Adyen_Corporate_Logo.svg/2560px-Adyen_Corporate_Logo.svg.png',
    coverImage:
      'https://images.unsplash.com/photo-1603201667230-bd139210db18?q=80&w=3888&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // C2
    location: 'Amsterdam',
    type: 'Full-Time',
    salary: {
      min: 75000,
      max: 95000,
      currency: 'EUR',
    },
    experience: '4-6 Years',
    description: `Lead the development of innovative payment solutions in our rapidly growing fintech platform. As a FinTech Product Manager at Adyen, you will work with cross-functional teams to define product strategy, drive execution, and ensure the successful delivery of cutting-edge financial products. **Define product vision, strategy, and roadmap** aligned with company goals. **Collaborate with engineering, design, marketing, and sales teams** to deliver high-quality products. **Conduct market research and competitive analysis** to identify opportunities and threats. **Manage the product lifecycle** from conception to launch, including feature prioritization and backlog management. **Engage with stakeholders and gather feedback** to continuously improve product offerings.`,
    requirements: [
      '**Experience in product management** within fintech or payments',
      '**Strong technical background** with API and platform products',
      '**Excellent stakeholder management skills**',
      '**Data-driven decision making approach**',
    ],
    roleBenefits: [
      '**Opportunity to work on global payment solutions** impacting millions of users.',
      '**A collaborative and inclusive work environment** that encourages innovation.',
      '**Access to professional development resources** and career advancement opportunities.',
      '**Competitive compensation package** with performance-based incentives.',
    ],
    status: 'active',
    postedAt: new Date().toISOString(),
    communityId: 'women-in-fintech',
    isEarlyApplicant: true,
    sisterScore: 88,
    benefits: [
      {
        icon: 'remote',
        label: 'Hybrid Working',
        description: 'Flexible work-from-home policy',
      },
      {
        icon: 'education',
        label: 'Learning & Development',
        description: '€5,000 annual learning budget',
      },
      {
        icon: 'travel',
        label: 'Travel Opportunities',
        description: 'International office exchanges',
      },
      {
        icon: 'health',
        label: 'Health & Wellness',
        description: 'Comprehensive health package',
      },
    ],
    companyInsights: {
      founded: 2006,
      size: '1000+',
      funding: 'Public',
      industry: 'Financial Technology',
      genderDiversity: {
        male: 52,
        female: 48,
      },
      description:
        'Leading global payment technology company revolutionizing the way the world pays and gets paid.',
      teamPhoto: {
        url: 'https://images.unsplash.com/photo-1590650046871-92c887180603?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // U2
        alt: 'Adyen team collaboration',
      },
      locations: [
        { name: 'Amsterdam', coordinates: [52.3676, 4.9041] },
        { name: 'Singapore', coordinates: [1.3521, 103.8198] },
        { name: 'San Francisco', coordinates: [37.7749, -122.4194] },
      ],
      employeeGrowth: {
        percentage: 25,
        period: 'last 12 months',
      },
      awards: [
        { title: 'Best FinTech Workplace 2023', year: '2023' },
        { title: 'Most Innovative Payment Provider', year: '2023' },
        { title: 'Top Tech Employer', year: '2022' },
      ],
      transparency: {
        responseTime: '24 hours',
        growthRate: '25%',
        rating: 4.8,
      },
    },
    workingPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1580512722189-29b4cbb9ffee?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // O3
        caption: 'Our modern Amsterdam office',
        category: 'office',
        size: 'large',
      },
      {
        url: 'https://images.unsplash.com/photo-1590650486895-79681b6f26a7?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // U3
        caption: 'Product team collaboration',
        category: 'collaboration',
        size: 'small',
      },
      {
        url: 'https://images.unsplash.com/photo-1561489413-985b06da5bee?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // E3
        caption: 'Team building activities',
        category: 'culture',
        size: 'medium',
      },
    ],
  },
  {
    id: '3',
    title: 'Blockchain Developer',
    company: 'ING Tech',
    companyLogo:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/ING_Group_N.V._Logo.svg/1280px-ING_Group_N.V._Logo.svg.png',
    coverImage:
      'https://images.unsplash.com/photo-1576267423429-569309b31e84?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // C3
    location: 'Amsterdam',
    type: 'Full-Time',
    salary: {
      min: 80000,
      max: 100000,
      currency: 'EUR',
    },
    experience: '3-5 Years',
    description: `Join our blockchain innovation team to develop decentralized financial solutions. As a Blockchain Developer at ING Tech, you will work on cutting-edge DeFi projects, collaborate with cross-functional teams, and contribute to the future of banking through innovative technology.

- **Design, develop, and deploy smart contracts** on Ethereum and other blockchain platforms.
- **Collaborate with product managers and designers** to implement blockchain-based features.
- **Conduct code reviews** and ensure the security and scalability of blockchain applications.
- **Stay updated with the latest blockchain trends** and integrate new technologies as needed.
- **Troubleshoot and resolve technical issues** related to blockchain integrations.`,
    requirements: [
      '**Strong experience with Ethereum and smart contracts**',
      '**Proficiency in Solidity and Web3.js**',
      '**Understanding of DeFi protocols**',
      '**Experience with financial applications**',
    ],
    roleBenefits: [
      '**Opportunity to work on pioneering blockchain projects** with real-world impact.',
      '**A collaborative environment** that encourages continuous learning and innovation.',
      '**Competitive salary and benefits package**, including opportunities for professional growth.',
      '**Access to state-of-the-art tools and resources** to support your development efforts.',
    ],
    status: 'active',
    postedAt: new Date().toISOString(),
    communityId: 'women-in-fintech',
    isEarlyApplicant: true,
    sisterScore: 82,
    benefits: [
      {
        icon: 'education',
        label: 'Certification Support',
        description: 'Full coverage for blockchain certifications',
      },
      {
        icon: 'remote',
        label: 'Flexible Working',
        description: '3 days remote, 2 days office',
      },
      {
        icon: 'bonus',
        label: 'Innovation Bonus',
        description: 'Rewards for patent filings',
      },
      {
        icon: 'health',
        label: 'Health Coverage',
        description: 'International health insurance',
      },
    ],
    companyInsights: {
      founded: 1991,
      size: '5000+',
      funding: 'Public',
      industry: 'Banking Technology',
      genderDiversity: {
        male: 58,
        female: 42,
      },
      description:
        "Leading European bank's technology division focusing on innovative financial solutions and digital transformation.",
      teamPhoto: {
        url: 'https://images.unsplash.com/photo-1571826945830-5423b80a986c?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // U4
        alt: 'ING Tech team',
      },
      locations: [
        { name: 'Amsterdam', coordinates: [52.3676, 4.9041] },
        { name: 'Frankfurt', coordinates: [50.1109, 8.6821] },
        { name: 'London', coordinates: [51.5074, -0.1278] },
      ],
      employeeGrowth: {
        percentage: 15,
        period: 'last 12 months',
      },
      awards: [
        { title: 'Best Banking Technology Employer', year: '2023' },
        { title: 'Innovation in Blockchain', year: '2023' },
        { title: 'Top Financial Technology Workplace', year: '2022' },
      ],
      transparency: {
        responseTime: '36 hours',
        growthRate: '15%',
        rating: 4.6,
      },
    },
    workingPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1461988625982-7e46a099bf4f?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // O4
        caption: 'Blockchain team workspace',
        category: 'office',
        size: 'large',
      },
      {
        url: 'https://images.unsplash.com/photo-1674574124473-e91fdcabaefc?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // E4
        caption: 'Tech meetup session',
        category: 'collaboration',
        size: 'medium',
      },
      {
        url: 'https://images.unsplash.com/photo-1590650213165-c1fef80648c4?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // C6 (using as culture image)
        caption: 'Innovation workshop',
        category: 'culture',
        size: 'small',
      },
    ],
  },
  {
    id: '4',
    title: 'Data Science Lead',
    company: 'Mollie',
    companyLogo: 'https://cdn.worldvectorlogo.com/logos/mollie-1.svg',
    coverImage:
      'https://images.unsplash.com/photo-1651094895186-9b2dca7c0b59?q=80&w=3869&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // C4
    location: 'Amsterdam',
    type: 'Full-Time',
    salary: {
      min: 85000,
      max: 110000,
      currency: 'EUR',
    },
    experience: '5-7 Years',
    description: `Lead our data science initiatives to improve payment processing efficiency and fraud detection. As the Data Science Lead at Mollie, you will build and manage a team of talented data scientists, develop advanced machine learning models, and drive data-driven decision-making across the organization.

- **Develop and implement machine learning models** to enhance payment processing and fraud detection.
- **Lead and mentor a team of data scientists**, fostering a culture of innovation and continuous improvement.
- **Collaborate with cross-functional teams** to integrate data science solutions into business processes.
- **Analyze large datasets** to extract actionable insights and inform strategic decisions.
- **Stay abreast of the latest advancements** in data science and apply best practices to projects.`,
    requirements: [
      '**PhD or MSc in Computer Science, Mathematics, or related field**',
      '**Experience leading data science teams**',
      '**Strong background in machine learning and statistics**',
      '**Knowledge of payment systems and fraud detection**',
    ],
    roleBenefits: [
      '**Opportunity to lead impactful projects** that shape the future of financial technology.',
      '**A supportive and collaborative team environment** with access to cutting-edge tools and resources.',
      '**Competitive salary and equity options**, along with a comprehensive benefits package.',
      '**Opportunities for professional growth and development** through training and conferences.',
    ],
    status: 'active',
    postedAt: new Date().toISOString(),
    communityId: 'women-in-fintech',
    isEarlyApplicant: true,
    sisterScore: 90,
    benefits: [
      {
        icon: 'education',
        label: 'Conference Budget',
        description: '€10,000 annual conference attendance',
      },
      {
        icon: 'remote',
        label: 'Remote First',
        description: 'Work from anywhere in Europe',
      },
      {
        icon: 'bonus',
        label: 'Stock Options',
        description: 'Competitive equity package',
      },
      {
        icon: 'fitness',
        label: 'Wellness Package',
        description: 'Mental and physical health support',
      },
    ],
    companyInsights: {
      founded: 2004,
      size: '500+',
      funding: 'Series C',
      industry: 'Payment Technology',
      genderDiversity: {
        male: 45,
        female: 55,
      },
      description:
        'Leading European payment service provider focusing on simplifying complex financial services.',
      teamPhoto: {
        url: 'https://images.unsplash.com/photo-1554902748-feaf536fc594?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // U6
        alt: 'Mollie data science team',
      },
      locations: [
        { name: 'Amsterdam', coordinates: [52.3676, 4.9041] },
        { name: 'London', coordinates: [51.5074, -0.1278] },
        { name: 'Paris', coordinates: [48.8566, 2.3522] },
      ],
      employeeGrowth: {
        percentage: 35,
        period: 'last 12 months',
      },
      awards: [
        { title: 'Best Workplace for Data Scientists', year: '2023' },
        { title: 'Top Payment Innovation', year: '2023' },
        { title: 'Best Tech Startup Culture', year: '2022' },
      ],
      transparency: {
        responseTime: '12 hours',
        growthRate: '35%',
        rating: 4.9,
      },
    },
    workingPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1562664377-709f2c337eb2?q=80&w=3120&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // O5
        caption: 'Data science team collaboration',
        category: 'collaboration',
        size: 'large',
      },
      {
        url: 'https://images.unsplash.com/photo-1590650213165-c1fef80648c4?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // C6 reused different job is allowed
        caption: 'Team whiteboarding session',
        category: 'collaboration',
        size: 'medium',
      },
      {
        url: 'https://images.unsplash.com/photo-1590650046871-92c887180603?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // U2 reused (different job)
        caption: 'Office culture',
        category: 'culture',
        size: 'small',
      },
    ],
  },
  {
    id: '5',
    title: 'Quantitative Researcher',
    company: 'Flow Traders',
    companyLogo:
      'https://upload.wikimedia.org/wikipedia/commons/0/08/Flow_Traders_logo.svg',
    coverImage:
      'https://images.unsplash.com/photo-1670851810697-68ddb4ecae1c?q=80&w=3682&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // C5
    location: 'Amsterdam',
    type: 'Full-Time',
    salary: {
      min: 90000,
      max: 120000,
      currency: 'EUR',
    },
    experience: '3-6 Years',
    description: `Join our quantitative research team to develop and implement trading strategies for cryptocurrency markets. As a Quantitative Researcher at Flow Traders, you will work with advanced mathematical models, analyze real-time market data, and collaborate closely with traders and technologists to drive profitable trading initiatives.

- **Develop and optimize algorithmic trading strategies** using quantitative methods.
- **Conduct statistical analysis and backtesting** to validate strategy performance.
- **Collaborate with software engineers** to implement and maintain trading systems.
- **Monitor market trends** and adjust strategies to adapt to changing conditions.
- **Present research findings and strategy performance** to stakeholders.`,
    requirements: [
      '**PhD in Mathematics, Physics, or related quantitative field**',
      '**Experience with algorithmic trading**',
      '**Strong programming skills in Python and C++**',
      '**Knowledge of cryptocurrency markets**',
    ],
    roleBenefits: [
      '**A highly collaborative and intellectually stimulating work environment**.',
      '**Access to cutting-edge technology and vast datasets** for research purposes.',
      '**Competitive salary with significant performance-based bonuses**.',
      '**Opportunities for professional growth and participation in industry conferences**.',
    ],
    status: 'active',
    postedAt: new Date().toISOString(),
    communityId: 'women-in-fintech',
    isEarlyApplicant: true,
    sisterScore: 85,
    benefits: [
      {
        icon: 'bonus',
        label: 'Performance Bonus',
        description: 'Uncapped bonus potential',
      },
      {
        icon: 'education',
        label: 'Research Budget',
        description: 'Access to academic resources and conferences',
      },
      {
        icon: 'health',
        label: 'Premium Healthcare',
        description: 'International health coverage',
      },
      {
        icon: 'fitness',
        label: 'Sports Facilities',
        description: 'On-site gym and sports activities',
      },
    ],
    companyInsights: {
      founded: 2004,
      size: '500+',
      funding: 'Public',
      industry: 'Trading Technology',
      genderDiversity: {
        male: 60,
        female: 40,
      },
      description:
        'Global technology-enabled liquidity provider specializing in exchange traded products.',
      teamPhoto: {
        url: 'https://images.unsplash.com/photo-1559653794-9868846db2f1?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // E6
        alt: 'Flow Traders research team',
      },
      locations: [
        { name: 'Amsterdam', coordinates: [52.3676, 4.9041] },
        { name: 'New York', coordinates: [40.7128, -74.006] },
        { name: 'Singapore', coordinates: [1.3521, 103.8198] },
      ],
      employeeGrowth: {
        percentage: 20,
        period: 'last 12 months',
      },
      awards: [
        { title: 'Best Trading Technology', year: '2023' },
        { title: 'Top Quantitative Employer', year: '2023' },
        { title: 'Innovation in Trading', year: '2022' },
      ],
      transparency: {
        responseTime: '24 hours',
        growthRate: '20%',
        rating: 4.7,
      },
    },
    workingPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?q=80&w=3876&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // O6
        caption: 'Research team collaboration',
        category: 'collaboration',
        size: 'large',
      },
      {
        url: 'https://images.unsplash.com/photo-1590650046871-92c887180603?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // U2 reused
        caption: 'Trading floor',
        category: 'office',
        size: 'medium',
      },
      {
        url: 'https://images.unsplash.com/photo-1559653794-7e71fa65c9c5?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // E7
        caption: 'Team activities',
        category: 'culture',
        size: 'small',
      },
    ],
  },
  {
    id: '6',
    title: 'Risk Analytics Manager',
    company: 'ABN AMRO',
    companyLogo:
      'https://play-lh.googleusercontent.com/qI_TUIRUO7VeW3x-Cf4u6tP3fIOLyRjstgNtO4fuJ64RzlbV12HnZ7p96oOrsukRLSw',
    coverImage:
      'https://images.unsplash.com/photo-1590650213165-c1fef80648c4?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // C6
    location: 'Amsterdam',
    type: 'Full-Time',
    salary: {
      min: 75000,
      max: 95000,
      currency: 'EUR',
    },
    experience: '5-8 Years',
    description: `Lead our risk analytics team in developing and implementing advanced risk models for retail and commercial banking. As the Risk Analytics Manager at ABN AMRO, you will focus on credit risk, market risk, and regulatory compliance, ensuring that our risk management strategies are robust and effective.

- **Develop and enhance quantitative risk models** to assess and mitigate financial risks.
- **Oversee the implementation of Basel regulations** and ensure compliance across departments.
- **Lead and mentor a team of risk analysts**, fostering a culture of excellence and continuous improvement.
- **Collaborate with IT and other departments** to integrate risk models into operational systems.
- **Analyze risk data and generate reports** for senior management and regulatory bodies.`,
    requirements: [
      "**Master's degree in Finance, Mathematics, or related field**",
      '**Experience with Basel regulations and risk modeling**',
      '**Strong programming skills in R or Python**',
      '**Team leadership experience**',
    ],
    roleBenefits: [
      '**A pivotal role in shaping the risk management framework** of a leading Dutch bank.',
      '**Opportunities for professional development and advancement** within the organization.',
      '**A supportive and inclusive work environment** that values diversity and collaboration.',
      '**Competitive compensation and comprehensive benefits package**.',
    ],
    status: 'active',
    postedAt: new Date().toISOString(),
    communityId: 'women-in-fintech',
    isEarlyApplicant: true,
    sisterScore: 87,
    benefits: [
      {
        icon: 'education',
        label: 'Professional Development',
        description: 'Full support for risk certifications',
      },
      {
        icon: 'remote',
        label: 'Hybrid Working',
        description: 'Flexible work arrangement',
      },
      {
        icon: 'bonus',
        label: 'Annual Bonus',
        description: 'Performance-based bonus structure',
      },
      {
        icon: 'health',
        label: 'Healthcare',
        description: 'Comprehensive health package',
      },
    ],
    companyInsights: {
      founded: 1824,
      size: '10000+',
      funding: 'Public',
      industry: 'Banking',
      genderDiversity: {
        male: 54,
        female: 46,
      },
      description:
        'Leading Dutch bank with a strong focus on sustainability and digital innovation in financial services.',
      teamPhoto: {
        url: 'https://images.unsplash.com/photo-1653762379480-f647e6228dc6?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // E1 reused
        alt: 'ABN AMRO risk team',
      },
      locations: [
        { name: 'Amsterdam', coordinates: [52.3676, 4.9041] },
        { name: 'Brussels', coordinates: [50.8503, 4.3517] },
        { name: 'Frankfurt', coordinates: [50.1109, 8.6821] },
      ],
      employeeGrowth: {
        percentage: 8,
        period: 'last 12 months',
      },
      awards: [
        { title: 'Best Bank for Sustainability', year: '2023' },
        { title: 'Innovation in Risk Management', year: '2023' },
        { title: 'Top Employer Netherlands', year: '2022' },
      ],
      transparency: {
        responseTime: '48 hours',
        growthRate: '8%',
        rating: 4.5,
      },
    },
    workingPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1628336707631-68131ca720c3?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // E2 reused
        caption: 'Risk team meeting',
        category: 'collaboration',
        size: 'large',
      },
      {
        url: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // U5
        caption: 'Analytics workshop',
        category: 'collaboration',
        size: 'medium',
      },
      {
        url: 'https://images.unsplash.com/photo-1573496774426-fe3db3dd1731?q=80&w=3869&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // C1 reused
        caption: 'Team building',
        category: 'culture',
        size: 'large',
      },
    ],
  },
  {
    id: '7',
    title: 'Compliance Technology Lead',
    company: 'Booking.com Financial Services',
    companyLogo:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Booking.com_logo.svg/2560px-Booking.com_logo.svg.png',
    coverImage:
      'https://images.unsplash.com/photo-1550071593-fd1bdaf1f93c?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // U1 reused as cover
    location: 'Amsterdam',
    type: 'Full-Time',
    salary: {
      min: 80000,
      max: 100000,
      currency: 'EUR',
    },
    experience: '6-8 Years',
    description: `Lead the development of our compliance technology platform, focusing on AML, KYC, and fraud prevention systems for our global financial services operations. As the Compliance Technology Lead at Booking.com Financial Services, you will drive the strategy and implementation of regulatory compliance solutions, ensuring our systems are robust, secure, and efficient.

- **Design and develop compliance technology solutions** to meet AML, KYC, and fraud prevention requirements.
- **Collaborate with legal and compliance teams** to understand regulatory needs and translate them into technical specifications.
- **Manage the development lifecycle**, including planning, execution, and deployment of compliance systems.
- **Lead and mentor a team of developers**, fostering a culture of innovation and continuous improvement.
- **Ensure the security and integrity of compliance data** through best practices and regular audits.`,
    requirements: [
      '**Experience with regulatory technology and compliance systems**',
      '**Strong background in financial services technology**',
      '**Knowledge of international financial regulations**',
      '**Team leadership experience**',
    ],
    roleBenefits: [
      '**Opportunity to lead critical projects** that ensure regulatory compliance and protect our financial services.',
      '**A dynamic and inclusive work environment** that values diversity and collaboration.',
      '**Competitive salary with performance-based incentives** and comprehensive benefits package.',
      '**Opportunities for professional growth and development** within a global organization.',
    ],
    status: 'active',
    postedAt: new Date().toISOString(),
    communityId: 'women-in-fintech',
    isEarlyApplicant: true,
    sisterScore: 89,
    benefits: [
      {
        icon: 'travel',
        label: 'Travel Benefits',
        description: 'Annual travel allowance',
      },
      {
        icon: 'remote',
        label: 'Remote Work',
        description: 'Global remote work options',
      },
      {
        icon: 'education',
        label: 'Learning Budget',
        description: '€7,500 annual development budget',
      },
      {
        icon: 'health',
        label: 'Health & Wellness',
        description: 'Comprehensive benefits package',
      },
    ],
    companyInsights: {
      founded: 1996,
      size: '5000+',
      funding: 'Public',
      industry: 'Travel Technology & Financial Services',
      genderDiversity: {
        male: 48,
        female: 52,
      },
      description:
        'Global leader in online travel expanding into innovative financial services solutions.',
      teamPhoto: {
        url: 'https://images.unsplash.com/photo-1561489413-985b06da5bee?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // E3 reused
        alt: 'Booking.com Financial Services team',
      },
      locations: [
        { name: 'Amsterdam', coordinates: [52.3676, 4.9041] },
        { name: 'Manchester', coordinates: [53.4808, -2.2426] },
        { name: 'Tel Aviv', coordinates: [32.0853, 34.7818] },
      ],
      employeeGrowth: {
        percentage: 30,
        period: 'last 12 months',
      },
      awards: [
        { title: 'Best Travel Fintech Innovation', year: '2023' },
        { title: 'Top Tech Employer Europe', year: '2023' },
        { title: 'Innovation in Compliance Tech', year: '2022' },
      ],
      transparency: {
        responseTime: '24 hours',
        growthRate: '30%',
        rating: 4.8,
      },
    },
    workingPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1600275669439-14e40452d20b?q=80&w=2667&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // O2
        caption: 'Tech team collaboration',
        category: 'collaboration',
        size: 'large',
      },
      {
        url: 'https://images.unsplash.com/photo-1560439450-57df7ac6dbef?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // E5 reused
        caption: 'Compliance workshop',
        category: 'collaboration',
        size: 'large',
      },
      {
        url: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // U5 reused
        caption: 'Compliance workshop',
        category: 'collaboration',
        size: 'medium',
      },
      {
        url: 'https://images.unsplash.com/photo-1576267423429-569309b31e84?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // C3 reused
        caption: 'Office culture',
        category: 'culture',
        size: 'small',
      },
    ],
  },
  {
    id: '8',
    title: 'Open Banking Product Owner',
    company: 'Rabobank',
    companyLogo:
      'https://upload.wikimedia.org/wikipedia/en/thumb/5/54/Rabobank_logo.svg/1200px-Rabobank_logo.svg.png',
    coverImage:
      'https://images.unsplash.com/photo-1590650486895-79681b6f26a7?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // U3 reused as cover
    location: 'Amsterdam',
    type: 'Full-Time',
    salary: {
      min: 70000,
      max: 90000,
      currency: 'EUR',
    },
    experience: '4-7 Years',
    description: `Lead our open banking initiatives, focusing on API development, partner integration, and innovative banking solutions. As the Open Banking Product Owner at Rabobank, you will drive the strategy and implementation of PSD2 compliance and beyond, ensuring seamless integration with third-party services and enhancing our digital banking offerings.

- **Define and execute the product roadmap** for open banking services.
- **Collaborate with engineering, design, legal, and compliance teams** to develop robust API solutions.
- **Manage partnerships with third-party providers**, ensuring alignment with Rabobank's standards and objectives.
- **Conduct market research** to identify new opportunities and stay ahead of industry trends.
- **Oversee the product lifecycle** from ideation to launch, including user testing and feedback integration.`,
    requirements: [
      '**Experience with open banking and PSD2**',
      '**Strong product management background**',
      '**Understanding of banking APIs and integration**',
      '**Stakeholder management skills**',
    ],
    roleBenefits: [
      '**A pivotal role in shaping the future of open banking** at a leading Dutch bank.',
      '**A collaborative and innovative work environment** that values your ideas and contributions.',
      '**Competitive salary with performance-based bonuses** and a comprehensive benefits package.',
      '**Opportunities for professional growth and development** within a global organization.',
    ],
    status: 'active',
    postedAt: new Date().toISOString(),
    communityId: 'women-in-fintech',
    isEarlyApplicant: true,
    sisterScore: 86,
    benefits: [
      {
        icon: 'education',
        label: 'Training Budget',
        description: '€5,000 annual learning allowance',
      },
      {
        icon: 'remote',
        label: 'Hybrid Work',
        description: 'Flexible working arrangements',
      },
      {
        icon: 'bonus',
        label: 'Innovation Bonus',
        description: 'Rewards for successful initiatives',
      },
      {
        icon: 'health',
        label: 'Wellness Package',
        description: 'Complete health coverage',
      },
    ],
    companyInsights: {
      founded: 1895,
      size: '10000+',
      funding: 'Cooperative',
      industry: 'Banking',
      genderDiversity: {
        male: 53,
        female: 47,
      },
      description:
        'Leading Dutch cooperative bank focusing on sustainable banking and agricultural innovation.',
      teamPhoto: {
        url: 'https://images.unsplash.com/photo-1603201667230-bd139210db18?q=80&w=3888&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // C2 reused
        alt: 'Rabobank innovation team',
      },
      locations: [
        { name: 'Amsterdam', coordinates: [52.3676, 4.9041] },
        { name: 'Utrecht', coordinates: [52.0907, 5.1214] },
        { name: 'London', coordinates: [51.5074, -0.1278] },
      ],
      employeeGrowth: {
        percentage: 10,
        period: 'last 12 months',
      },
      awards: [
        { title: 'Best Open Banking Implementation', year: '2023' },
        { title: 'Sustainable Banking Award', year: '2023' },
        { title: 'Digital Innovation Excellence', year: '2022' },
      ],
      transparency: {
        responseTime: '36 hours',
        growthRate: '10%',
        rating: 4.6,
      },
    },
    workingPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1580512722189-29b4cbb9ffee?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // O3 reused
        caption: 'Innovation hub workspace',
        category: 'office',
        size: 'large',
      },
      {
        url: 'https://images.unsplash.com/photo-1653762379480-f647e6228dc6?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // E1 reused
        caption: 'API team meeting',
        category: 'collaboration',
        size: 'medium',
      },
      {
        url: 'https://images.unsplash.com/photo-1576267423429-569309b31e84?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // C3 reused
        caption: 'Team activities',
        category: 'culture',
        size: 'small',
      },
    ],
  },
];

export const mockJobs: Record<string, Job> = {
  '1': {
    id: '1',
    title: 'Software Engineer',
    company: 'TechCorp',
    companyLogo: 'https://example.com/logo1.png',
    location: 'San Francisco',
    type: 'Full-time',
    salary: {
      min: 120000,
      max: 180000,
      currency: 'USD',
    },
    experience: '3-5 years',
    description: 'Join our engineering team...',
    requirements: ['React', 'TypeScript', 'Node.js'],
    postedAt: new Date('2024-01-01').toISOString(),
  },
  '2': {
    id: '2',
    title: 'Product Manager',
    company: 'InnovateCo',
    companyLogo: 'https://example.com/logo2.png',
    location: 'New York',
    type: 'Full-time',
    salary: {
      min: 130000,
      max: 190000,
      currency: 'USD',
    },
    experience: '5+ years',
    description: 'Lead product development...',
    requirements: ['Product Management', 'Agile', 'Technical Background'],
    postedAt: new Date('2024-01-02').toISOString(),
  },
};

// Testimonials remain unchanged, no image repetition issue there
export const JOB_TESTIMONIALS = {
  'FinTech Product Manager': [
    {
      name: 'Lisa Chen',
      title: 'Senior Product Manager',
      avatar:
        'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop',
      quote:
        'Working at Adyen has been transformative for my career. The level of innovation and impact you can have here is unmatched.',
    },
    {
      name: 'Mark Thompson',
      title: 'Product Lead',
      avatar:
        'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=120&h=120&fit=crop',
      quote:
        'The culture of innovation and continuous learning makes this a fantastic place for product managers to grow.',
    },
  ],
  'Blockchain Developer': [
    {
      name: 'Sophie Williams',
      title: 'Lead Developer',
      avatar:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop',
      quote:
        'ING Tech offers an incredible environment for blockchain innovation. The support for new ideas is remarkable.',
    },
    {
      name: 'Alex Kumar',
      title: 'Senior Developer',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
      quote:
        'The blockchain team here is working on cutting-edge projects that are reshaping the future of banking.',
    },
  ],
};

// COMPANY_PHOTOS can remain unchanged or similarly updated if required, but the user did not specify that we must use these sets there, and no duplicates are in the same object
export const COMPANY_PHOTOS = {
  Adyen: [
    {
      url: 'https://images.unsplash.com/photo-1557804500-7a58fbcd4d1a?q=80&w=3774&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      caption: 'Modern office space in Amsterdam',
      category: 'office',
      size: 'large',
    },
    {
      url: 'https://images.unsplash.com/photo-1653762379480-f647e6228dc6?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      caption: 'Product team collaboration',
      category: 'collaboration',
      size: 'medium',
    },
  ],
  'ING Tech': [
    {
      url: 'https://images.unsplash.com/photo-1653762379480-f647e6228dc6?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      caption: 'Innovation lab',
      category: 'collaboration',
      size: 'large',
    },
    {
      url: 'https://images.unsplash.com/photo-1573496774426-fe3db3dd1731?q=80&w=3869&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      caption: 'Tech meetup',
      category: 'culture',
      size: 'medium',
    },
  ],
  Mollie: [
    {
      url: 'https://images.unsplash.com/photo-1557804500-7a58fbcd4d1a?q=80&w=3774&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      caption: 'Data science workspace',
      category: 'office',
      size: 'large',
    },
    {
      url: 'https://images.unsplash.com/photo-1653762379480-f647e6228dc6?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      caption: 'Team collaboration',
      category: 'collaboration',
      size: 'medium',
    },
  ],
};
