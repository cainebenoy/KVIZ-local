
# Quiz Presentation Website

## Overview

An admin-only tool for creating, presenting, and managing quizzes and leaderboards. Built with Next.js, Supabase, and Radix UI. Designed for live quiz presentations, not public participation.

## Features

- **Google Auth (Supabase):** Only authorized admins can log in.
- **Quiz Management:** Create, edit, delete, and present quizzes (question-by-question, timer, image upload, answer mode).
- **Leaderboard Management:** Add/edit/delete winners, upload winner photos, create new seasons.
- **Admin Management:** Add/remove admin users.
- **Public Views:** Shareable read-only quiz and leaderboard pages.
- **Auto-cycle:** Quiz presentation auto-advances when timer ends.
- **Responsive UI:** Presentation-friendly, large fonts, clear layout.

## Usage

### Admin Dashboard
- Create/manage quizzes: `/dashboard/quizzes/create`, `/dashboard/quizzes/manage`
- Present quiz: `/dashboard/quizzes/present`
- Manage leaderboard: `/dashboard/leaderboard`
- Manage admins: `/dashboard/admins`

### Public/Viewer
- View leaderboard: `/leaderboard`
- View quiz (read-only): `/quizzes/[id]`

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Radix UI
- **Backend:** Supabase (Auth, Database, Storage)
- **Hosting:** Vercel

## Environment Variables

Set these in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_VERCEL_URL`

## Deployment

Live at: [https://vercel.com/cainebenoy-gmailcoms-projects/v0-quiz-presentation-website](https://vercel.com/cainebenoy-gmailcoms-projects/v0-quiz-presentation-website)

## How It Works

1. Admin logs in via Google.
2. Create/manage quizzes and leaderboard.
3. Present quizzes live or share public links.
4. All data is stored and synced via Supabase.
