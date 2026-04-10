# NutriMind AI 🧠🍃

> AI-Powered Food Analysis & Sugar Habit Tracking

NutriMind AI is a web application that helps users consciously track sugar consumption, receive AI-based food analysis, and build healthier habits. It supports **English**, **Russian**, and **Kazakh** languages.

---

## Features

- **AI Food Analysis** – Upload a food photo + description and receive estimated sugar content via AI (Gemini 2.0 Flash Vision)
- **Sugar-Free Timer** – Track how long you've been sugar-free with a live countdown
- **Daily Statistics** – View meals logged each day with total sugar consumption
- **Multi-Language** – Full i18n support for English, Русский, Қазақша
- **Secure Auth** – JWT-based authentication with bcrypt-hashed password
- **Responsive Design** – Works on desktop, tablet, and mobile

---

## Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | React 18, Vite, React Router |
| Backend    | Node.js, Express             |
| Database   | Supabase (PostgreSQL)        |
| AI         | Google Gemini 2.0 Flash (Vision + LLM) |
| Auth       | JWT + bcrypt                 |
| Styling    | Custom CSS (design system)   |

---

## Quick Start

### 1. Prerequisites

- **Node.js** 18+
- **Supabase** account ([supabase.com](https://supabase.com))
- **Google Gemini API Key** (optional – fallback analysis available)

### 2. Clone & Install

```bash
cd infomatrix-project-version-1
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/migration.sql`
3. Copy your project URL, anon key, and service role key

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your actual keys:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-secure-secret-at-least-32-chars
GEMINI_API_KEY=your-gemini-api-key
```

### 5. Run Development Server

```bash
npm run dev
```

This starts both:
- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:3001

---

## Project Structure

```
├── index.html              # HTML entry point
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── .env.example            # Environment variables template
├── server/                 # Express backend
│   ├── index.js            # Server entry point
│   ├── lib/supabase.js     # Supabase client
│   ├── middleware/auth.js   # JWT authentication
│   ├── routes/
│   │   ├── auth.js         # Register, login, logout
│   │   ├── meals.js        # Meal CRUD + AI analysis
│   │   ├── timer.js        # Sugar-free timer
│   │   └── user.js         # User profile & settings
│   └── services/
│       └── aiAnalysis.js   # Gemini food analysis
├── src/                    # React frontend
│   ├── main.jsx            # React entry
│   ├── App.jsx             # Router & routes
│   ├── contexts/           # Auth & Language contexts
│   ├── components/         # Shared components
│   ├── pages/              # Page components
│   ├── locales/            # i18n JSON files (en, ru, kz)
│   └── styles/             # CSS modules
└── supabase/
    └── migration.sql       # Database schema
```

---

## API Endpoints

| Method | Endpoint              | Description              | Auth |
|--------|-----------------------|--------------------------|------|
| POST   | `/api/auth/register`  | Register new user        | No   |
| POST   | `/api/auth/login`     | Login                    | No   |
| POST   | `/api/auth/logout`    | Logout                   | No   |
| GET    | `/api/user/profile`   | Get user profile         | Yes  |
| PUT    | `/api/user/language`  | Update language           | Yes  |
| POST   | `/api/meals`          | Upload & analyze meal    | Yes  |
| GET    | `/api/meals`          | Get meals (by date)      | Yes  |
| GET    | `/api/meals/latest`   | Get latest meal          | Yes  |
| DELETE | `/api/meals/:id`      | Delete a meal            | Yes  |
| GET    | `/api/timer`          | Get timer status         | Yes  |
| POST   | `/api/timer/start`    | Start timer              | Yes  |
| POST   | `/api/timer/reset`    | Reset timer              | Yes  |

---

## ⚠ Disclaimer

Sugar estimates provided by NutriMind AI are **approximate** and should not be used for medical decisions. Always consult a healthcare professional for dietary advice.

---

## License

This project was built for the Infomatrix competition.
