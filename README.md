# Troly — Operating System for Vietnamese Rental Properties (10–100 Rooms)

Troly is a modern, high-density SaaS platform and Progressive Web App (PWA) tailored specifically for Vietnamese landlords managing boarding houses (*nhà trọ*), mini-apartments (*chung cư mini*), and serviced rental properties (*căn hộ dịch vụ*).

---

## ⚡ Key Features

- **High-Speed Door-to-Door Meter Reading:** Optimized keyboard navigation (`Tab`/`Enter`), auto-diff calculation against historical figures, and anomaly warning rings.
- **Dynamic VietQR & Napas 24/7:** Instant generation of bank QR codes with exact payment syntaxes (`TROLY [ROOM] [MONTH]`) for seamless auto-reconciliation.
- **1-Click Bulk Invoicing:** Batch generate itemized statements (Rent, Electricity, Water, Internet, Trash, Parking) in seconds.
- **A4 Printable Invoices & PDF Export:** Clean, professional invoice templates ready for paper print or Zalo sharing.
- **Dual-Mode Storage Adapter:** Runs seamlessly out of the box using LocalStorage + rich Vietnamese seed data, or seamlessly switches to production Supabase PostgreSQL when `.env.local` credentials are provided.
- **Responsive PWA:** Mobile-first navigation for on-the-go inspections and readings in dim hallways.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15 (App Router, Turbopack, Root Directory structure)
- **Language:** TypeScript 5.7
- **UI & Components:** React 19, Tailwind CSS v4, shadcn/ui primitives, Lucide Icons, Framer Motion
- **State Management:** TanStack Query v5 (Server state), Zustand (Client state)
- **Forms & Validation:** React Hook Form + Zod
- **Backend & Database:** Supabase (PostgreSQL 16, Row Level Security, Auth OTP)
- **Data Visualization:** Recharts

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

By default, the application runs in **Dual-Mode LocalStorage**, populated with realistic seed data for 3 properties and 48 rooms in Ho Chi Minh City.

### 3. Connect Production Supabase (Optional)
Copy `.env.example` to `.env.local` and add your project credentials:
```bash
cp .env.example .env.local
```
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
Apply the 12 production migrations located in `supabase/migrations/` to your Supabase SQL Editor.

---

## 📂 Project Structure

```
d:/Startup/
├── app/                  # Next.js 15 App Router (Auth, Dashboard, Modules, PWA)
├── components/           # UI Design System (Button, Input, Table, StatCard, etc.)
├── hooks/                # Data hooks (TanStack Query)
├── lib/                  # Utilities, VietQR, Dual-Mode Data Adapters
├── stores/               # Zustand UI stores
├── types/                # Domain models, Database schemas, Zod forms
└── supabase/
    └── migrations/       # 12 Production SQL Migrations
```

---

## 📄 License
Commercial proprietary software. All rights reserved.
