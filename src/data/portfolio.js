// ─────────────────────────────────────────────────────────────────────────────
//  EVERYTHING ON THE SITE COMES FROM THIS FILE.
//
//  • Photos: put the image in public/images/… and write its path, e.g.
//      portrait: '/images/portrait.jpg'
//    If the file is missing, the site shows a designed fallback instead of a broken image.
//  • GitHub links: when a project is done, paste its repo URL into `github`.
//    Until then the site shows "GitHub link coming soon".
//  • Status: 'shipped', 'building' or 'planned'.
//    Move a project to 'shipped' when you finish it and watch the map fill up.
// ─────────────────────────────────────────────────────────────────────────────

export const profile = {
  name: 'Parth P Patil',
  role: 'Software Developer & Computer Science Student',
  degree: 'B.Tech CSE',
  year: 3, // current year of your degree; the profile card and map update from this
  totalYears: 4,
  college: 'Dr. D. Y. Patil School of Science and Technology',
  campus: 'Tathawade, Pune',
  location: 'Pune, India',
  availability: 'Open to Software Engineering Internships',
  email: 'parthpatil8106@gmail.com',
  resume: '/resume.html',
  github: 'https://github.com/parth-cypher',
  linkedin: 'https://www.linkedin.com/in/parth-patil-32ab08394',
  twitter: 'https://x.com/parthppatil8',
  headline:
    'I’m a Computer Science Engineering student passionate about building intelligent systems, practical software and digital experiences through AI, machine learning and full-stack development.',
  about: [
    'I’m Parth Patil, a Computer Science Engineering student at Dr. D. Y. Patil School of Science and Technology, Pune.',
    'I enjoy turning ideas into functional products, exploring AI/ML, software engineering and system design.',
    'Alongside academics, I work as a Technical Manager at TGT Esports, where I handle gaming hardware, PC maintenance, infrastructure and technical operations.',
    'I enjoy learning by building real projects and continuously improving my engineering skills.',
  ],

  // Portrait on the profile card (4:5, at least 800 × 1000 px). Missing file → designed fallback.
  portrait: '/images/portrait.jpg',
}

// The four tracks on the project map. Each project belongs to one.
export const lines = {
  ai: { id: 'ai', name: 'Artificial Intelligence', short: 'AI', color: '#7457C9' },
  data: { id: 'data', name: 'Machine Learning', short: 'ML', color: '#1F8F8A' },
  systems: { id: 'systems', name: 'Systems', short: 'Systems', color: '#BF8A26' },
  web: { id: 'web', name: 'Web Development', short: 'Web', color: '#CF5B4A' },
}

export const statuses = {
  shipped: { label: 'Shipped', meaning: 'Working and live' },
  building: { label: 'In progress', meaning: 'Being built now' },
  planned: { label: 'Planned', meaning: 'Next up' },
}

// Every project is a station on the map. `short` is the name used on the map and the status board
// (keep it under 21 characters). Order inside a line = order along the line on the map.
export const stations = [
  // ── AI line ────────────────────────────────────────────────────────────────
  {
    id: 'iscanai',
    line: 'ai',
    short: 'Cataract AI',
    title: 'Cataract Detection AI',
    subtitle: 'iScanAI · medical image classification',
    status: 'shipped',
    note: '93.3% accuracy',
    description:
      'An AI-powered cataract detection project using MobileNetV2 and TensorFlow, shaped through real debugging, model evaluation and a deployment workflow.',
    highlights: [
      '93.3% accuracy on 60 held-out test images',
      'MobileNetV2 transfer learning with 142 of 152 layers frozen',
      'Deployed as a live demo on Hugging Face Spaces',
    ],
    stack: ['Python', 'TensorFlow', 'MobileNetV2', 'Hugging Face'],
    demo: 'https://huggingface.co/spaces/parth888/iscanai',
    github: 'https://github.com/parth-cypher/iscanai-',
    caseStudy: '/iscanai-report.pdf',
    screenshot: '', // e.g. '/images/projects/iscanai.png'
  },
  {
    id: 'swarm-drones',
    line: 'ai',
    short: 'Swarm drone system',
    title: 'Autonomous Swarm Drone System',
    subtitle: 'Major project · disaster search & rescue',
    status: 'shipped',
    note: 'Simulation prototype',
    description:
      'A low-cost multi-drone coordination prototype for disaster search and rescue. A ground control station splits the search area into grid sectors, assigns them to three simulated drones and streams live telemetry.',
    highlights: [
      'Working: three simulated drones, grid search and a live telemetry dashboard',
      'Working: simulated drone failure with cost-based task reassignment',
      'In development: AI person detection and physical drone hardware',
    ],
    stack: ['Python', 'FastAPI', 'React', 'WebSocket'],
    demo: '',
    github: 'https://github.com/parth-cypher/swarm-drone-system',
    caseStudy: '',
    screenshot: '/images/projects/swarm-drones.jpg',
  },

  // ── Machine learning line ──────────────────────────────────────────────────
  {
    id: 'card-fraud',
    line: 'data',
    short: 'Card fraud',
    title: 'Credit Card Fraud Detection',
    subtitle: 'Random Forest vs SVM',
    status: 'shipped',
    note: '',
    description:
      'Trains a Random Forest and a Support Vector Machine to flag potentially fraudulent card transactions, compares them on the same held-out test set and presents the results in an interactive dashboard.',
    highlights: ['Kaggle ULB credit card transactions dataset', 'Fair side-by-side model comparison', 'Streamlit dashboard for results'],
    stack: ['Python', 'Scikit-learn', 'Random Forest', 'SVM', 'Streamlit'],
    demo: '',
    github: '',
    caseStudy: '',
    screenshot: '/images/projects/card-fraud.jpg',
    shotFit: 'contain', // a chart: show it whole instead of cropping
  },
  {
    id: 'purchase-intent',
    line: 'data',
    short: 'Purchase intent',
    title: 'Customer Purchase Intent Prediction',
    subtitle: 'Decision Tree vs Naive Bayes',
    status: 'shipped',
    note: '',
    description:
      'Predicts whether an online shop visitor will make a purchase based on how they browsed, comparing a Decision Tree against Gaussian Naive Bayes on the same test data.',
    highlights: ['UCI Online Shoppers dataset: 12,330 sessions, 17 features', 'Streamlit app with a live prediction form'],
    stack: ['Python', 'Scikit-learn', 'Decision Tree', 'Naive Bayes', 'Streamlit'],
    demo: '',
    github: 'https://github.com/parth-cypher/customer-purchase-intent',
    caseStudy: '',
    screenshot: '/images/projects/purchase-intent.jpg',
    shotFit: 'contain',
  },
  {
    id: 'athlete-bio',
    line: 'data',
    short: 'Athlete bios',
    title: 'Athlete Biography Classification',
    subtitle: 'TF-IDF + Decision Tree',
    status: 'shipped',
    note: '',
    description:
      'Reads a short athlete biography and predicts their sport: football, cricket, basketball, tennis, athletics or other. Text is turned into TF-IDF features and classified with a Decision Tree.',
    highlights: ['Athlete biographies from the DBpedia Classes dataset', 'Streamlit dashboard to classify new biographies and inspect model results'],
    stack: ['Python', 'Scikit-learn', 'TF-IDF', 'Decision Tree', 'Streamlit'],
    demo: '',
    github: 'https://github.com/parth-cypher/Athlete-Biography-Classification-using-Decision-Tree-Classifier',
    caseStudy: '',
    screenshot: '',
  },
  {
    id: 'finsecure',
    line: 'data',
    short: 'FinSecure',
    title: 'FinSecure',
    subtitle: 'SME bankruptcy prediction',
    status: 'shipped',
    note: '',
    // TODO: confirm your contribution before deploying; edit or remove this project if needed.
    description:
      'Predicts bankruptcy risk for small and medium enterprises from financial ratios, with explainable results and an interactive interface.',
    highlights: ['Ensemble of Logistic Regression, Random Forest and XGBoost', 'SHAP explanations of the ratios behind each prediction', 'Gradio interface'],
    stack: ['Python', 'Scikit-learn', 'XGBoost', 'SHAP', 'Gradio'],
    demo: '',
    github: '',
    caseStudy: '',
    screenshot: '',
  },

  {
    id: 'insurance-fraud',
    line: 'data',
    short: 'Insurance fraud',
    title: 'Auto Insurance Fraud Detection',
    subtitle: 'Tree-based ensemble models',
    status: 'shipped',
    note: '',
    description:
      'Flags auto insurance claims that are likely to be fraudulent using tree-based models, with feature importance analysis to show which factors drive each prediction.',
    highlights: ['Random Forest and XGBoost models', 'Feature importance charts for interpretability'],
    stack: ['Python', 'Scikit-learn', 'XGBoost', 'Pandas'],
    demo: '',
    github: 'https://github.com/parth-cypher/auto-insurance-fraud-detection',
    caseStudy: '',
    screenshot: '/images/projects/insurance-fraud.jpg',
    shotFit: 'contain',
  },
  {
    id: 'fund-clustering',
    line: 'data',
    short: 'Fund clustering',
    title: 'Mutual Fund Clustering',
    subtitle: 'Hierarchical clustering',
    status: 'shipped',
    note: '',
    description:
      'Groups 814 Indian mutual fund schemes by risk and return with agglomerative hierarchical clustering, then checks whether the groups make sense against their official categories.',
    highlights: ['Unsupervised: the model never sees the official categories', 'Streamlit dashboard with the dendrogram and a fund lookup'],
    stack: ['Python', 'Scikit-learn', 'Pandas', 'Streamlit'],
    demo: '',
    github: 'https://github.com/parth-cypher/mutual-fund-clustering-',
    caseStudy: '',
    screenshot: '/images/projects/fund-clustering.jpg',
    shotFit: 'contain',
  },

  // ── Systems line ───────────────────────────────────────────────────────────
  {
    id: 'memlab',
    line: 'systems',
    short: 'MEMLAB',
    title: 'Dynamic Memory Allocation Simulator',
    subtitle: 'MEMLAB · operating systems',
    status: 'shipped',
    note: '',
    description:
      'A memory-debugger-style workbench for studying contiguous memory allocation. It runs First, Best, Worst and Next Fit on an address-accurate memory model and compares them on identical workloads.',
    highlights: ['Variable and fixed partitioning', 'Every region visualised, every event logged', 'Framework-free allocation engine with unit tests'],
    stack: ['React', 'TypeScript', 'Vite', 'Vitest'],
    demo: '',
    github: 'https://github.com/parth-cypher/memlab',
    caseStudy: '',
    screenshot: '/images/projects/memlab.jpg',
  },
  {
    id: 'job-scheduling',
    line: 'systems',
    short: 'Job scheduler',
    title: 'Job Scheduling System',
    subtitle: 'CPU scheduling · command line',
    status: 'shipped',
    note: '',
    description:
      'A command-line program that runs First-Come-First-Served and Shortest-Job-First scheduling on a set of jobs and reports the execution order and average waiting time.',
    highlights: [],
    stack: ['Python'],
    demo: '',
    github: 'https://github.com/parth-cypher/job-scheduling-system',
    caseStudy: '',
    screenshot: '',
  },

  // ── Web line ───────────────────────────────────────────────────────────────
  {
    id: 'habit-tracker',
    line: 'web',
    short: 'Habit tracker',
    title: 'Habit Tracker',
    subtitle: 'Full-stack app',
    status: 'shipped',
    note: '',
    description:
      'A full-stack habit system with authentication, backend routing, a database model and a clean product experience for tracking daily consistency.',
    highlights: ['JWT authentication', 'Node and Express REST API', 'MongoDB data model', 'Responsive React dashboard'],
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT'],
    demo: '', // the old GitHub Pages link returned 404; add the working URL here
    github: '', // the old repo link returned 404 (private or renamed)
    caseStudy: '/habit-tracker-report.pdf',
    screenshot: '',
  },
  {
    id: 'notes-compiler',
    line: 'web',
    short: 'Notes compiler',
    title: 'Online Notes Compiler',
    subtitle: 'Browser app',
    status: 'shipped',
    note: '',
    description: 'A browser-based notes app: save notes by subject, keep them in local storage and export all of them as a PDF.',
    highlights: [],
    stack: ['HTML', 'CSS', 'JavaScript'],
    demo: '',
    github: 'https://github.com/parth-cypher/online-notes-compiler',
    caseStudy: '',
    screenshot: '',
  },
]

// Where you have been: the education timeline in About and the grey track into the map.
export const route = [
  { place: 'Chiplun', stage: 'SSC', school: 'SPM School, Parshuram', state: 'done' },
  { place: 'Karad', stage: 'HSC Science', school: 'Ligade Patil Junior College of Science and Technology', state: 'done' },
  { place: 'Pune', stage: 'B.Tech CSE · Third year', school: 'Dr. D. Y. Patil School of Science and Technology, Pune', state: 'current' },
]

// Where you are heading: the dashed track on the map. Edit these as your goals change.
export const nextStops = [
  { short: 'SWE internship', text: 'A software engineering internship' },
  { short: 'Full-stack depth', text: 'Deeper full-stack architecture' },
  { short: 'Applied AI', text: 'Shipping AI features in real products' },
  { short: 'Systems at scale', text: 'Deployment infrastructure and scalable systems' },
]

// No dates or achievements are listed on purpose; add them here only once they are confirmed.
export const experience = [
  {
    role: 'Technical Manager',
    org: 'TGT Esports',
    kind: 'Current',
    line: 'systems',
    description:
      'Responsible for technical operations at a gaming facility, including high-performance PC maintenance, hardware diagnostics, troubleshooting, gaming infrastructure, inventory management and technical support.',
    points: [
      'Gaming PC maintenance',
      'Hardware diagnostics and repairs',
      'Technical infrastructure',
      'Stock and equipment management',
      'PS5 gaming setup management',
      'Technical operations',
    ],
  },
]

export const skillGroups = [
  { title: 'Frontend', lines: ['web'], items: ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'] },
  { title: 'Backend', lines: ['web'], items: ['Node.js', 'Express', 'MySQL'] },
  {
    title: 'AI & Machine Learning',
    lines: ['ai', 'data'],
    items: ['Python', 'TensorFlow', 'MobileNetV2', 'Scikit-learn', 'Random Forest', 'SVM', 'Decision Tree', 'Naive Bayes'],
  },
  { title: 'Core CS', lines: ['systems'], items: ['Java', 'Data Structures & Algorithms', 'DBMS', 'Operating Systems'] },
  { title: 'Tools', lines: [], items: ['Git', 'GitHub', 'VS Code', 'Figma', 'Vercel', 'Hugging Face'] },
]

// Notes to self: one line at a time rotates under the hero. Write your own.
export const announcements = [
  'Every project on this map started as an empty folder.',
  'Learning only counts once it ships.',
  'Small builds, every week.',
  'Year 3 of 4. The map is still being drawn.',
]
