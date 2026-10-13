
export const projects = [
  {
    id: '01',
    name: 'AI Career Copilot',
    category: 'AI / FULL STACK',
    subtitle: 'Your next career move, intelligently guided.',
    description:
      'An AI-powered career assistant that analyzes resumes, matches them with job descriptions, and provides actionable feedback to improve applications.',
    tags: ['React', 'Python', 'FastAPI', 'Gemini API', 'PDF Processing'],
    live: 'https://ai-career-copilot-kappa.vercel.app/',
    github: 'https://github.com/likith097/ai-career-copilot',
    theme: 'cyan',
    symbol: 'AI',
    status: 'LIVE',
  },
  {
    id: '02',
    name: 'CINEORA',
    category: 'FULL STACK / ENTERTAINMENT',
    subtitle: 'A better way to find your next watch.',
    description:
      'A cinematic movie discovery experience featuring search, filtering, recommendations, and a personal watchlist.',
    tags: ['Movie Discovery', 'Search', 'Filtering', 'Watchlist'],
    live: 'https://cineora-movies.vercel.app/',
    github: 'https://github.com/likith097/cineora',
    theme: 'violet',
    symbol: 'C',
    status: 'LIVE',
  },
  {
    id: '03',
    name: 'Project Velocity',
    category: 'INTERACTIVE WEB / PORTFOLIO',
    subtitle: 'The portfolio is the project.',
    description:
      'A phased, game-inspired engineering portfolio featuring a recruiter-ready interface and an explorable cyberpunk 3D city.',
    tags: ['React', 'TypeScript', 'Vite', 'Three.js', 'Interactive UI'],
    live: 'https://project-velocity-nine.vercel.app/',
    github: 'https://github.com/likith097/project-velocity',
    theme: 'orange',
    symbol: 'LK',
    status: 'LIVE',
  },
]

export const experiences = [
  {
    role: 'Software Engineer',
    company: 'PayPal',
    location: 'USA',
    dates: 'JUN 2025 — PRESENT',
    points: [
      'Architected distributed payment services using Java 17, Spring Boot, REST APIs, and Apache Kafka; reported 35% higher throughput and 28% lower p95 latency.',
      'Delivered React, TypeScript, Node.js, and Express.js experiences connected to secure backend APIs.',
      'Built Python-based generative AI and RAG workflows for retrieving payment documentation and operational knowledge.',
      'Worked with AWS, Docker, Kubernetes, OAuth 2.0, JWT, CI/CD, and production observability.',
    ],
    tags: ['Java 17', 'Spring Boot', 'Kafka', 'React', 'AWS', 'GenAI'],
  },
  {
    role: 'Software Engineer',
    company: 'PNC',
    location: 'USA',
    dates: 'DEC 2023 — MAY 2024',
    points: [
      'Engineered financial-services microservices with Java 17, Spring Boot, Spring Security, and REST APIs.',
      'Automated AWS infrastructure provisioning with Terraform for database and analytics workloads.',
      'Built secure integrations and responsive interfaces with React, Angular, and TypeScript.',
      'Supported automated delivery and testing with Jenkins, Docker, Kubernetes, JUnit, and Mockito.',
    ],
    tags: ['Java', 'Spring Boot', 'Terraform', 'AWS', 'React'],
  },
  {
    role: 'Software Developer',
    company: 'Groww',
    location: 'India',
    dates: 'JAN 2021 — JUL 2023',
    points: [
      'Designed Java and Spring Boot services for investment, portfolio, and account workflows.',
      'Implemented event-driven processing with Apache Kafka and Kafka Streams.',
      'Built web experiences using React, Angular, JavaScript, and TypeScript.',
      'Optimized APIs using Redis caching, SQL tuning, and database indexing; resume reports improvement from 200 ms to 60 ms.',
    ],
    tags: ['Java', 'Kafka', 'React', 'Redis', 'SQL'],
  },
]

export const skills = [
  {
    icon: 'backend',
    title: 'Backend engineering',
    subtitle: 'THE ENGINE',
    items: [
      'Java 8/11/17',
      'Spring Boot',
      'Python',
      'Node.js',
      'REST APIs',
      'Microservices',
      'OAuth 2.0 / JWT',
    ],
  },
  {
    icon: 'frontend',
    title: 'Frontend systems',
    subtitle: 'THE COCKPIT',
    items: [
      'React',
      'TypeScript',
      'JavaScript',
      'Angular',
      'HTML / CSS',
      'Responsive UI',
    ],
  },
  {
    icon: 'cloud',
    title: 'Cloud & delivery',
    subtitle: 'FLIGHT INFRASTRUCTURE',
    items: [
      'AWS',
      'Docker',
      'Kubernetes',
      'Jenkins',
      'CI/CD',
      'Terraform',
      'Linux',
    ],
  },
  {
    icon: 'ai',
    title: 'AI & machine learning',
    subtitle: 'NAVIGATION INTELLIGENCE',
    items: [
      'Generative AI',
      'LLMs',
      'RAG',
      'PyTorch',
      'TensorFlow',
      'Scikit-learn',
      'Vector embeddings',
    ],
  },
  {
    icon: 'data',
    title: 'Data & messaging',
    subtitle: 'TELEMETRY SYSTEMS',
    items: [
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'Oracle',
      'Apache Kafka',
      'Redis',
      'SQL',
    ],
  },
] as const

export const about = {
  introduction:
    "I'm Likith, a software engineer focused on turning complex problems into useful, production-ready experiences. My work spans full-stack engineering, distributed backend systems, cloud infrastructure, and applied AI.",
  philosophy:
    'I enjoy connecting the dots between thoughtful user experiences and reliable systems—the kind of work that turns ideas into products people can actually use.',
  education: [
    {
      degree: 'Master of Science, Computer Science',
      institution: 'University of Alabama at Birmingham',
      year: '2025',
    },
    {
      degree: 'Bachelor of Technology',
      institution: 'Graphic Era University',
      year: '2023',
    },
  ],
  certifications: [
    'AWS Certified Solutions Architect — Associate',
    'Create Image Captioning Models with Google Cloud',
  ],
}

export const contact = {
  email: 'Likithkumarxiv@gmail.com',
  linkedin: 'https://www.linkedin.com/in/likithkum710/',
  github: 'https://github.com/likith097',
  resume: '/Likith-Kumar-Resume.pdf',
}

export const gmailCompose =
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact.email)}`
