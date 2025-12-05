# BizStep - Your Personal Business Coach 💼

BizStep is an all-in-one business coaching and financial management platform designed for aspiring entrepreneurs. Browse over 140 business types, follow step-by-step roadmaps, track finances, and get AI-powered business advice.

## 🚀 Features

### Business Management
- **140+ Business Templates** - Browse businesses across 10 categories (Agriculture, Food, Retail, Services, etc.)
- **Step-by-Step Roadmaps** - Guided instructions with video tutorials, checklists, and cost estimates
- **AI Business Advisor** - Get personalized insights and answers to your business questions
- **Progress Tracking** - Monitor your completion of each roadmap step

### Financial Tracking
- **CAPEX vs OPEX** - Separate tracking for one-time investments and recurring expenses
- **Revenue Tracking** - Monitor income and calculate net profit
- **Visual Reports** - Charts showing income vs expenses over time
- **Export Options** - Generate reports in PDF, Excel, or CSV format

### Personal Finance (Wallet Planner)
- **Income Tracking** - Track salary, side jobs, and other income sources
- **Expense Management** - Categorize expenses across 18 categories
- **Budget Alerts** - Get notified when approaching or exceeding budget limits
- **Savings Goals** - Set and track business savings targets

### Loan Marketplace
- **Browse Lenders** - Explore microfinance and loan options
- **Compare Rates** - View interest rates, terms, and requirements
- **Apply Online** - Submit loan applications directly through the platform

## 🛠️ Tech Stack

- **React 18** - UI library
- **React Router** - Client-side routing
- **TanStack React Query** - Data fetching and state management
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **Lucide React** - Icon library

## 📦 Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📂 Project Structure

```
bizstep/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components (Button, Card, Input)
│   │   └── Layout.jsx       # Main layout with sidebar navigation
│   ├── pages/
│   │   ├── Home.jsx         # Browse business types
│   │   ├── MyBusiness.jsx   # Business roadmap & AI advisor
│   │   ├── Finances.jsx     # CAPEX/OPEX/Revenue tracking
│   │   ├── WalletPlanner.jsx # Personal finance management
│   │   ├── LoansAndSavings.jsx # Loan marketplace
│   │   ├── Reports.jsx      # Financial reports
│   │   ├── BankAccounts.jsx # Bank connections
│   │   ├── BusinessPlans.jsx # Business planning
│   │   └── Profile.jsx      # User settings
│   ├── hooks/
│   │   └── useLocalStorage.js # Local storage hook
│   ├── lib/
│   │   └── utils.js         # Utility functions & constants
│   ├── App.jsx              # Main app with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎯 Key Pages

- **Home** - Browse and search 140+ business types by category
- **My Business** - View roadmap, track progress, chat with AI advisor
- **Finances** - Track business CAPEX, OPEX, and revenue with charts
- **Wallet Planner** - Manage personal income, expenses, and budgets
- **Loans & Savings** - Find financing and set savings goals
- **Reports** - Generate and export financial reports
- **Profile** - Manage account settings and preferences

## 🌍 Multi-Currency Support

BizStep supports multiple currencies including:
- USD ($), EUR (€), GBP (£)
- NGN (₦), KES (KSh), ZAR (R)
- INR (₹), GHS (₵)

Currency is automatically detected based on selected country.

## 📱 Responsive Design

The app is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones

## 🔮 Future Enhancements

- Base44 SDK integration for backend
- Real bank account connections
- Advanced AI business insights
- Community features
- Multi-language support

## 📄 License

MIT License - feel free to use this project for your own purposes!
