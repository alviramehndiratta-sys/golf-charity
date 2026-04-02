# GolfGives — Golf Charity Prize Draw Platform

> **Your Stableford score is your lottery ticket.**

GolfGives is a subscription-based web platform that connects amateur golfers with charitable giving through a monthly prize draw. Players use the Stableford scores they already earn on the course as entries into a lottery — no extra effort required. A portion of every subscription goes directly to a charity of the member's choice.

---

## How It Works

1. **Subscribe** — Choose a monthly or yearly plan.
2. **Pick a Charity** — Browse partner charities across Health, Education, Environment, and more. Decide what percentage of your subscription (minimum 10%) goes to your chosen cause.
3. **Log Your Scores** — Enter up to 5 recent Stableford scores (1–45). These become your draw numbers. The platform always keeps your five most recent scores active.
4. **Win Prizes** — Every month, five numbers are drawn. The more of your scores that match, the bigger your share of the prize pool.

### Prize Tiers

| Matches | Prize |
|---------|-------|
| 5 (Jackpot) | 40% of the prize pool (rolls over if no winner) |
| 4 Matches | 35% of the prize pool |
| 3 Matches | 25% of the prize pool |

---

## Features

### For Members
- **Score Dashboard** — Log and manage your five active Stableford scores at any time.
- **Charity Selection** — Choose from a directory of vetted partner charities and adjust your contribution percentage with a slider.
- **Winnings History** — View past wins, prize amounts, and payout status in one place.
- **Flexible Subscriptions** — Monthly and yearly plans available.

### Draw System
- Five numbers are drawn each month.
- Results are published publicly, including drawn numbers, prize tier winners, and historical draw archives.
- Jackpot rolls over when no five-match winner is found.

### Admin Suite
- **Analytics Dashboard** — Overview of total users, active subscribers, monthly revenue, and pending payouts.
- **User & Charity Management** — Manage member accounts and add or edit charity partners.
- **Draw Control** — Simulate and publish monthly draws, triggering automated winner calculation and prize distribution.
- **Payout Verification** — Review and process winner payouts.

---

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js / Express (REST API)
- **Monorepo:** pnpm workspaces

---

## Project Structure

```
/
├── artifacts/
│   ├── golf-charity/        # React frontend
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── home.tsx         # Landing page & pricing
│   │       │   ├── dashboard.tsx    # Member dashboard
│   │       │   ├── draws.tsx        # Prize draw results
│   │       │   └── admin/           # Admin management suite
│   │       └── components/
│   └── api-server/          # Express API backend
└── README.md
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) v8+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/golf-gives.git
cd golf-gives

# Install dependencies
pnpm install
```

### Running Locally

```bash
# Start the API server
pnpm --filter api-server dev

# Start the frontend (in a separate terminal)
pnpm --filter golf-charity dev
```

The frontend will be available at `http://localhost:5173` and the API at `http://localhost:3000`.

---

## Subscription Plans

| Plan | Price | Charity Contribution |
|------|-------|----------------------|
| Monthly | ₹999 / month | Min. 10% (adjustable up to 100%) |
| Yearly | ₹9,999 / year | Min. 10% (adjustable up to 100%) |

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## License

[MIT](LICENSE)
