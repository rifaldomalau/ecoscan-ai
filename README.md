# EcoScan AI

AI-powered waste classification and environmental education platform.

## Overview

EcoScan AI membantu pengguna mengidentifikasi jenis sampah menggunakan AI, memberikan panduan pembuangan yang benar, menjelaskan dampak lingkungan, serta memberikan ide penggunaan kembali barang agar lebih ramah lingkungan.

Aplikasi ini dikembangkan sebagai Full-Stack MVP untuk IndonesiaNEXT Hackathon menggunakan Next.js, Supabase, dan OpenAI API.

---

## Features

- AI Waste Classification
- Waste Disposal Guide
- Environmental Impact Analysis
- Reuse Recommendations
- Scan History
- Eco Score Dashboard
- Authentication
- Responsive Interface

---

## Tech Stack

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend

- Next.js Route Handlers

### Database

- Supabase PostgreSQL
- Supabase Authentication
- Supabase Storage

### AI

- OpenAI Responses API

### Deployment

- Vercel

---

## Project Structure

```
src/
│
├── app/
├── components/
├── services/
├── lib/
├── hooks/
├── types/
├── actions/
├── utils/
└── styles/
```

---

## Getting Started

Clone repository

```bash
git clone https://github.com/rifaldomalau/ecoscan-ai.git
```

Install dependencies

```bash
npm install
```

Copy environment variables

```bash
cp .env.example .env.local
```

Run development server

```bash
npm run dev
```

Open

```
http://localhost:3000
```

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

OPENAI_API_KEY=
```

---

## Deployment

Project is deployed using Vercel.

Deployment Steps

1. Push project to GitHub.
2. Import repository into Vercel.
3. Configure all environment variables.
4. Deploy.
5. Connect Supabase production project.
6. Verify API routes and authentication.

---

## AI Workflow

User

↓

Upload image or input waste name

↓

API Route

↓

OpenAI Analysis

↓

Supabase Save

↓

Dashboard Update

↓

History

---

## License

This project is created for the IndonesiaNEXT Hackathon.
