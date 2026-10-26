# 🚀 FinTrack AI — Personal Expense Analytics & Smart Budget Planner

<div align="center">

![FinTrack AI Banner](screenshots/banner.png)

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask)](https://flask.palletsprojects.com)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python)](https://python.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.3-F7931E?logo=scikit-learn)](https://scikit-learn.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**FinTrack AI** is a full-stack personal finance management application with an integrated AI/ML module for smart expense predictions, budget recommendations, and spending analysis.

[📊 Live Demo](#) · [🐛 Report Bug](#) · [✨ Request Feature](#)

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Folder Structure](#-folder-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Machine Learning Workflow](#-machine-learning-workflow)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 🌟 Project Overview

FinTrack AI is a comprehensive personal finance tracker that helps users:

- Log and manage income and expenses
- Set monthly budgets and track spending
- Generate insightful financial reports
- Use machine learning to predict future expenses
- Receive personalized budget recommendations and saving tips

Built with a **React + Vite** frontend, **Flask** backend, **SQLAlchemy ORM**, and a **scikit-learn ML pipeline**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Secure register/login with bcrypt password hashing |
| 📊 **Interactive Dashboard** | Real-time KPI cards, charts, and recent transactions |
| 💸 **Expense Management** | Full CRUD with search, filter, pagination |
| 💰 **Income Management** | Track multiple income sources |
| 🏦 **Budget Planner** | Monthly budget goals with status tracking |
| 📈 **Financial Reports** | Daily, weekly, monthly, yearly reports with export |
| 🔬 **Analytics** | Category breakdown, trends, savings analysis |
| 🤖 **ML Predictions** | Expense prediction, budget recommendation, spending analysis |
| 💡 **Saving Tips** | Personalized AI-generated savings advice |
| 👤 **Profile Management** | Edit profile, upload avatar, change password |
| 🔔 **Notifications** | In-app notification system |
| ⚙️ **Settings** | Dark mode, currency, language, notification preferences |

---

## 🛠️ Technology Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| HTTP Client | Axios |
| Charts | Chart.js + react-chartjs-2 |
| PDF Export | jsPDF + jsPDF-Autotable |
| Icons | React Icons (Font Awesome 6) |
| Toasts | React Toastify |

### Backend
| Layer | Technology |
|---|---|
| Framework | Flask 3 |
| ORM | Flask-SQLAlchemy 3 |
| Authentication | Flask-JWT-Extended |
| Password Hashing | Flask-Bcrypt |
| CORS | Flask-Cors |
| Production Server | Gunicorn |
| Serialization | Marshmallow |

### Machine Learning
| Layer | Technology |
|---|---|
| ML Framework | scikit-learn |
| Data Processing | Pandas + NumPy |
| Model Persistence | Joblib |
| Algorithms | Linear Regression, Random Forest |

### Database
| Environment | Database |
|---|---|
| Development | SQLite |
| Production | MySQL 8 |

---

## 📂 Folder Structure

```
FinTrack-AI/
├── frontend/                   # React + Vite application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # AuthContext (global state)
│   │   ├── pages/              # Route-level page components
│   │   ├── services/           # Axios API service layer
│   │   └── utils/
│   ├── .env.example
│   ├── vite.config.js
│   ├── vercel.json
│   └── netlify.toml
│
├── backend/                    # Flask REST API
│   ├── controllers/            # HTTP handler layer (MVC)
│   ├── services/               # Business logic layer
│   ├── models/                 # SQLAlchemy ORM models
│   ├── routes/                 # Blueprint route registration
│   ├── middlewares/            # Error handlers, JWT auth
│   ├── machine_learning/       # ML pipeline
│   │   ├── data_preprocessor.py
│   │   ├── expense_prediction.py
│   │   ├── budget_recommendation.py
│   │   ├── spending_analysis.py
│   │   ├── saving_tips.py
│   │   └── models/             # Saved joblib model files
│   ├── utils/                  # Security, validators, logger
│   ├── app.py                  # Flask app factory
│   ├── config.py               # Environment-based config
│   ├── requirements.txt
│   ├── gunicorn.conf.py
│   └── Procfile
│
├── database/
│   ├── schema.sql              # MySQL production schema
│   └── seed.sql                # Demo seed data
│
├── docs/
│   ├── API_DOCUMENTATION.md
│   └── PROJECT_REPORT.md
│
├── screenshots/
├── .gitignore
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** v18+ and **npm** v9+
- **Python** 3.10+
- **pip** (Python package manager)
- **Git**

### Clone the Repository

```bash
git clone https://github.com/your-username/FinTrack-AI.git
cd FinTrack-AI
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local   # Configure your API URL
npm run dev                  # Start on http://localhost:5173
```

### Backend Setup

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env          # Fill in your secrets
python run.py                 # Start on http://localhost:5000
```

---

## 🔑 Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Backend API base URL |

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | Flask session secret |
| `JWT_SECRET_KEY` | ✅ | JWT signing secret |
| `SQLALCHEMY_DATABASE_URI` | ✅ | Database connection string |
| `CORS_ORIGINS` | ✅ | Comma-separated allowed origins |
| `FLASK_ENV` | ✅ | `development` or `production` |
| `UPLOAD_FOLDER` | ❌ | Profile picture upload path |
| `MAX_CONTENT_LENGTH` | ❌ | Max upload size (bytes) |

---

## 🗄️ Database Setup

### Development (SQLite — automatic)

```bash
# SQLite is created automatically on first run
python run.py
```

### Production (MySQL)

```bash
# Create database
mysql -u root -p < database/schema.sql

# (Optional) Load demo data
mysql -u root -p fintrack_db < database/seed.sql

# Set connection string in .env
SQLALCHEMY_DATABASE_URI=mysql+pymysql://user:pass@host:3306/fintrack_db
```

---

## ▶️ Running the Application

### Development Mode

```bash
# Terminal 1 — Backend
cd backend && python run.py

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open: **http://localhost:5173**

### Production Build (Frontend)

```bash
cd frontend
npm run build          # Output: frontend/dist/
npm run preview        # Preview production build locally
```

### Production Server (Backend)

```bash
cd backend
gunicorn --config gunicorn.conf.py "app:create_app()"
```

---

## 🤖 Machine Learning Workflow

1. **Data Collection**: Expense and income records fetched from the database per user.
2. **Preprocessing**: Records aggregated into monthly time-series data with feature engineering (lag features, rolling averages, cyclical encoding).
3. **Synthetic Data**: If a user has < 6 months of data, realistic synthetic data is auto-generated to supplement training.
4. **Training**: Linear Regression and Random Forest trained; best model selected by RMSE.
5. **Persistence**: Models saved with `joblib` in `backend/machine_learning/models/`.
6. **Inference**: Prediction API calls the saved model for sub-second predictions.

### ML Endpoints

| Feature | Endpoint |
|---|---|
| Expense Prediction | `GET /api/ml/predict-expense` |
| Budget Recommendation | `GET /api/ml/budget-recommendation` |
| Spending Analysis | `GET /api/ml/spending-analysis` |
| Saving Tips | `GET /api/ml/saving-tips` |

---

## 📡 API Endpoints

See [API Documentation](docs/API_DOCUMENTATION.md) for full details.

### Quick Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login user |
| GET | `/api/dashboard/summary` | ✅ | Dashboard KPIs |
| GET/POST | `/api/expenses` | ✅ | List/Create expenses |
| GET/POST | `/api/income` | ✅ | List/Create incomes |
| GET/POST | `/api/budget` | ✅ | List/Create budgets |
| GET | `/api/reports/monthly` | ✅ | Monthly report |
| GET | `/api/ml/predict-expense` | ✅ | ML expense prediction |
| GET | `/api/profile` | ✅ | Get user profile |

---

## 📸 Screenshots

| Dashboard | Expenses | ML Predictions |
|---|---|---|
| ![Dashboard](screenshots/dashboard.png) | ![Expenses](screenshots/expenses.png) | ![ML](screenshots/prediction.png) |

---

## 🔮 Future Enhancements

- [ ] SMS/Email budget alert notifications
- [ ] Multi-currency support with live exchange rates
- [ ] Recurring expense tracking (subscriptions)
- [ ] Bank statement PDF import (auto-parsing)
- [ ] Mobile app (React Native)
- [ ] Shared household budgets
- [ ] Investment portfolio tracking
- [ ] AI chatbot for financial queries
- [ ] Offline PWA support

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ by <strong>Aastha Gupta</strong> · FinTrack AI © 2026
</div>
