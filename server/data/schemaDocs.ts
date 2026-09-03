export const PRISMA_SCHEMA_CODE = `// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum TrackCategory {
  TECHNICAL
  NON_TECHNICAL
}

enum WorkFormat {
  IN_PERSON
  REMOTE
  HYBRID
}

model User {
  id           String        @id @default(uuid())
  name         String
  email        String        @unique
  chosenTrack  TrackCategory @default(TECHNICAL)
  targetDomain String?
  streakDays   Int           @default(1)
  longestStreak Int          @default(1)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  
  resumeScans  ResumeScan[]
  savedEvents  SavedEvent[]
}

model Domain {
  id           String        @id
  name         String
  category     TrackCategory
  description  String
  iconName     String?
  popularTags  String[]
  createdAt    DateTime      @default(now())

  internships  Internship[]
  hackathons   Hackathon[]
}

model Internship {
  id             String        @id @default(uuid())
  domainId       String
  domain         Domain        @relation(fields: [domainId], references: [id])
  title          String
  company        String
  stipend        String
  stipendAmount  Int?
  location       String
  format         WorkFormat    @default(HYBRID)
  requiredSkills String[]
  summary        String[]
  deadline       DateTime
  registrationUrl String
  createdAt      DateTime      @default(now())

  savedBy        SavedEvent[]
}

model Hackathon {
  id              String        @id @default(uuid())
  domainId        String
  domain          Domain        @relation(fields: [domainId], references: [id])
  title           String
  host            String
  prizePool       String
  prizeAmount     Int?
  location        String
  format          WorkFormat    @default(IN_PERSON)
  requiredSkills  String[]
  summary         String[]
  deadline        DateTime
  registrationUrl String
  participantCount Int          @default(0)
  createdAt       DateTime      @default(now())

  savedBy         SavedEvent[]
}

model ResumeScan {
  id                  String   @id @default(uuid())
  userId              String?
  user                User?    @relation(fields: [userId], references: [id])
  targetDomain        String
  matchScore          Int      // 0 to 100
  matchedSkills       String[]
  missingKeywords     String[]
  recommendations     String[]
  suggestedProjects   String[]
  timestamp           DateTime @default(now())
}

model SavedEvent {
  id            String      @id @default(uuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  internshipId  String?
  internship    Internship? @relation(fields: [internshipId], references: [id])
  hackathonId   String?
  hackathon     Hackathon?  @relation(fields: [hackathonId], references: [id])
  status        String      @default("saved") // saved, applied, interviewing, accepted
  createdAt     DateTime    @default(now())

  @@unique([userId, internshipId, hackathonId])
}
`;

export const SQL_DDL_CODE = `-- PostgreSQL DDL Schema for StreakMind Portal
CREATE TYPE track_category AS ENUM ('technical', 'non-technical');
CREATE TYPE work_format AS ENUM ('in-person', 'remote', 'hybrid');

CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    chosen_track track_category DEFAULT 'technical',
    target_domain VARCHAR(100),
    streak_days INTEGER DEFAULT 1,
    longest_streak INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE domains (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category track_category NOT NULL,
    description TEXT NOT NULL,
    icon_name VARCHAR(64),
    popular_tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE internships (
    id VARCHAR(64) PRIMARY KEY,
    domain_id VARCHAR(64) REFERENCES domains(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    stipend VARCHAR(100) NOT NULL,
    stipend_amount INTEGER,
    location VARCHAR(255) NOT NULL,
    format work_format DEFAULT 'hybrid',
    required_skills TEXT[] NOT NULL,
    summary TEXT[] NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hackathons (
    id VARCHAR(64) PRIMARY KEY,
    domain_id VARCHAR(64) REFERENCES domains(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    host VARCHAR(255) NOT NULL,
    prize_pool VARCHAR(100) NOT NULL,
    prize_amount INTEGER,
    location VARCHAR(255) NOT NULL,
    format work_format DEFAULT 'in-person',
    required_skills TEXT[] NOT NULL,
    summary TEXT[] NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_url TEXT NOT NULL,
    participant_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resume_scans (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    target_domain VARCHAR(100) NOT NULL,
    match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    matched_skills TEXT[] NOT NULL,
    missing_keywords TEXT[] NOT NULL,
    recommendations TEXT[] NOT NULL,
    suggested_projects TEXT[] NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

export const SEED_JS_CODE = `// seed.js — Node.js Database Seeder
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding StreakMind Portal database...');

  // 1. Seed Domains
  const domains = [
    {
      id: 'ai-ml',
      name: 'AI / Machine Learning',
      category: 'TECHNICAL',
      description: 'Generative AI, Large Language Models, Neural Systems',
      popularTags: ['PyTorch', 'LLMs', 'Transformers', 'Gemini API', 'MLOps']
    },
    {
      id: 'web-dev',
      name: 'Full-Stack Web Dev',
      category: 'TECHNICAL',
      description: 'Modern frontend, scalable distributed backends',
      popularTags: ['React', 'TypeScript', 'Node.js', 'PostgreSQL']
    },
    {
      id: 'product-mgmt',
      name: 'Product Management',
      category: 'NON_TECHNICAL',
      description: 'Product strategy, user discovery, roadmapping',
      popularTags: ['PRD Writing', 'User Research', 'A/B Testing', 'Agile']
    },
    {
      id: 'marketing-growth',
      name: 'Marketing & Growth',
      category: 'NON_TECHNICAL',
      description: 'Growth marketing, lifecycle campaigns & performance analytics',
      popularTags: ['Content Strategy', 'Growth Loops', 'SEO', 'Paid Ads']
    }
  ];

  for (const d of domains) {
    await prisma.domain.upsert({
      where: { id: d.id },
      update: {},
      create: d,
    });
  }

  // 2. Seed Sample User
  const demoUser = await prisma.user.upsert({
    where: { email: 'alex.builder@example.com' },
    update: {},
    create: {
      name: 'Alex Chen',
      email: 'alex.builder@example.com',
      chosenTrack: 'TECHNICAL',
      targetDomain: 'ai-ml',
      streakDays: 37,
      longestStreak: 45,
    }
  });

  // 3. Seed Internships
  await prisma.internship.createMany({
    data: [
      {
        domainId: 'marketing-growth',
        title: 'Product Marketing Internship at TechCorp',
        company: 'TechCorp Enterprise',
        stipend: '$4,800 / month',
        stipendAmount: 4800,
        location: 'San Francisco, CA',
        format: 'HYBRID',
        requiredSkills: ['GTM Strategy', 'Content Marketing', 'User Persona Research'],
        summary: [
          'Lead product launch go-to-market strategies for next-generation developer tooling.',
          'Collaborate with Product Managers and Engineering leads.'
        ],
        deadline: new Date('2026-09-20'),
        registrationUrl: 'https://careers.techcorp.example/internships/prm',
      },
      {
        domainId: 'web-dev',
        title: 'Full-Stack Software Engineering Intern',
        company: 'Stripe Horizon Labs',
        stipend: '$9,200 / month + Housing',
        stipendAmount: 9200,
        location: 'San Francisco, CA',
        format: 'IN_PERSON',
        requiredSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        summary: [
          'Design, ship, and operate mission-critical payment orchestration APIs.',
          'Build rich, accessible interactive merchant dashboards in React.'
        ],
        deadline: new Date('2026-09-30'),
        registrationUrl: 'https://stripe.com/jobs/university',
      }
    ],
    skipDuplicates: true
  });

  // 4. Seed Hackathons
  await prisma.hackathon.createMany({
    data: [
      {
        domainId: 'ai-ml',
        title: 'AI Hackathon: Future City 2026',
        host: 'San Francisco AI Collective & Anthropic Hub',
        prizePool: '$50,000 Prize Pool',
        prizeAmount: 50000,
        location: 'San Francisco, CA',
        format: 'IN_PERSON',
        requiredSkills: ['Python', 'Gemini / OpenAI API', 'FastAPI', 'React'],
        summary: [
          'Build AI-redefined urban infrastructure and smart mobility applications.',
          'Access to GPU clusters and direct VC judging panel.'
        ],
        deadline: new Date('2026-09-15'),
        registrationUrl: 'https://devpost.com/hackathons/future-city',
        participantCount: 420,
      }
    ],
    skipDuplicates: true
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;
