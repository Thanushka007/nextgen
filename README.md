[README (1).md](https://github.com/user-attachments/files/31790986/README.1.md)
# StreakMind — Internship & Hackathon AI Portal

StreakMind is an AI-powered portal that helps students discover technical and non-technical internships and hackathons. It combines opportunity discovery with AI-driven tools to help you prepare and stay consistent — including resume matching, a domain tutor, and a streak tracker to keep you on track.

🔗 **Live App:** [nextgenportal-3036.ai.studio](https://nextgenportal-3036.ai.studio)

## ✨ Features

- **AI Resume Matching** — Matches your resume against internship/hackathon listings using the Gemini API to surface the most relevant opportunities.
- **Domain Tutor** — An AI tutor that helps you learn and brush up on domain-specific concepts relevant to the opportunities you're targeting.
- **Streak Tracker** — Tracks your daily engagement/progress to help build consistent prep habits.
- **Opportunity Discovery** — Browse curated technical and non-technical internships and hackathons in one place.

## 🛠️ Tech Stack

- **React** + **TypeScript**
- **Vite** — build tool and dev server
- **Google Gemini API** — powers the AI features (resume matching, domain tutor)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- A [Google Gemini API key](https://ai.google.dev/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/<your-repo>.git
   cd <your-repo>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:

   Create a `.env` (or `.env.local`) file in the project root:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal) in your browser.

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
├── src/
│   ├── components/     # UI components
│   ├── pages/           # App pages/views
│   ├── services/        # Gemini API integration and other services
│   └── ...
├── public/               # Static assets
├── .env.local            # Environment variables (not committed)
└── package.json
```

> Adjust this section to match your actual folder layout.

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your API key for the Google Gemini API, used to power AI Resume Matching and the Domain Tutor |

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the [issues page](../../issues) if you want to contribute.

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ to help students land internships and ace hackathons.
