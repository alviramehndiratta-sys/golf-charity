# Golf Charity Subscription Platform

A full-stack web application that combines golf score tracking, monthly prize draws, and charitable contributions.

Users enter their Stableford golf scores, which act as entries into a monthly draw. A portion of each subscription is donated to a charity selected by the user.

---

## 🚀 Features

* Authentication & Roles — Secure login with user/admin access
* Subscription System — Monthly and yearly plans with access control
* Score Management — Maximum 5 scores per user (auto-removes oldest)
* Draw System — Monthly draw with 3 prize tiers (5, 4, 3 matches)
* Prize Pool Logic — Dynamic calculation with jackpot rollover
* Charity System — Minimum 10% contribution, user-selectable
* Winner Verification — Proof upload and admin approval flow
* Dashboards — User and Admin panels with core functionality

---

## 🧱 Tech Stack

* Frontend: React (Vite), Tailwind CSS
* Backend: Node.js / Express
* Database: Supabase
* Payments: Stripe

---

## ⚙️ Setup

```bash
git clone https://github.com/alviramehndiratta-sys/golf-charity.git
cd golf-charity/charity
pnpm install
pnpm --filter golf-charity dev
```

Run backend (optional):

```bash
pnpm --filter api-server dev
```

---

## 🌐 Live Demo

Deployed on Vercel (frontend only). Backend-dependent features may be limited in demo.

---

## 💡 Key Logic

* Only the latest 5 scores are stored per user
* New scores automatically replace the oldest
* Draw system matches user scores with generated numbers
* Prize pool is split dynamically (40% / 35% / 25%)
* Fully database-driven (no hardcoded values)

---

## ⚠️ Requirements

Tested on Node.js v18/v20.
May not work correctly on Node v24 due to dependency compatibility.

---

## 📌 Notes

This project was developed as part of a selection task and focuses on implementing the core logic (score system, draw system, and role-based access).

Environment variables and API keys are not included for security reasons and need to be configured separately.
