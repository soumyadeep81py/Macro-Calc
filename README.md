# Macros Calc

A fast,  calorie tracking application built with Next.js, tailored for both Indian diets and custom food entry.


## Features

- **Neo-Brutalist Design:** Bold colors, sharp corners, and high-contrast accessibility.
- **Supabase Integration:** Secure user authentication (Email/Password) and PostgreSQL database storage.
- **Natural Language Parsing:** Type things like "2 eggs" or "200g rice" to quickly add foods.
- **Custom Foods:** Add specific macros (Protein, Carbs, Fat) for foods not in the built-in database.
- **BMR & TDEE Calculator:** Built-in tools on the Profile page to set your baseline daily goals.
- **Weekly Tracking:** Visual bar charts tracking your progress over the past 7 days.

## Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) (Vanilla custom classes for the brutalist aesthetic)
- **Language:** TypeScript
- **Backend/Auth:** [Supabase](https://supabase.com) (PostgreSQL + Auth)
- **Deployment:** [Vercel](https://vercel.com) (Recommended)

## Local Development

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.
You will also need a [Supabase](https://database.new) account to set up the backend.

### 1. Supabase Setup

1. Create a new project in Supabase.
2. In the Supabase SQL Editor, run the schema script provided in `Calorie.md` to create the `profiles`, `custom_foods`, and `food_logs` tables.
3. **Important:** Enable Row Level Security (RLS) on all three tables and add policies so users can only view and manage their own data.
4. Obtain your Project URL and Anon Public Key from the Supabase API settings.

### 2. Environment Variables

Create a `.env.local` file in the root of the project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install & Run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment (Vercel)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to a GitHub repository.
2. Log in to Vercel and click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. **Environment Variables:** During the Vercel setup, make sure to add both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the Environment Variables section.
5. Click **Deploy**.

Once the build finishes, you will be given a live URL for your production application!

## License

© 2026 Soumyadeep Ghosh for easy macros tracking.
