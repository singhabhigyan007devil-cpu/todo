# ⚡ TaskFlow — Persona-Driven Smart Task Manager & AI Meeting intelligence

TaskFlow is a state-of-the-art, premium-designed web application built on **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Supabase**. Designed around professional human workflows, TaskFlow breaks away from generic checklists by adapting its layout, dashboard modules, and interactive tooling to the selected user persona.

---

## ✨ Features & Architecture

TaskFlow utilizes a modular layout, transitioning features seamlessly based on your active role:

### 👤 Workspace Personas
1. **Student Workspace**
   * **Eisenhower Matrix**: Categorize tasks dynamically into four priority quadrants (*Urgent & Important*, *Important but Not Urgent*, *Urgent but Not Important*, *Not Urgent & Not Important*).
   * **Pomodoro Focus Timer**: Customizable study block cycles, short/long breaks, total session indicators, and alert notifications.
   * **Subtask Breakdowns**: Deconstruct larger goals into micro-tasks directly inside card views.

2. **Creative Workspace**
   * **Moodboard & Inspirations Panel**: Pin visual concepts, styled quotation slides, bookmarks, reference links, and custom color swatches.
   * **Hex Color Clipboard Tool**: One-click hex value copying for palette management.
   * **Task Links**: Bind design ideas and moodboard assets directly to specific action items.

3. **Professional Workspace**
   * **Roadmap Planner**: Distribute tasks across quarterly milestones (`Q1`, `Q2`, `Q3`, `Q4`) to track progress timelines.
   * **Target Board**: Track active goals, progress bars, and execution metrics.
   * **Detailed Analytics**: Inspect completion rates, streaks, and category distribution charts.

4. **Personal & Lifestyle Workspace**
   * **Habits & Streak Checklist**: Log daily and weekly habits.
   * **7-Day Interactive Progress Tracker**: Visual completion check bubbles showing active streaks.

5. **Business Workspace & AI Meeting Intelligence**
   * **Meeting Tracker**: Schedule calls, log client attendees, organize notes, and include direct Google Meet urls.
   * **PPTX Text Parser & Summarizer**: Upload a `.pptx` deck; the client-side parser unzips files dynamically using `JSZip` to extract XML text nodes on the fly.
   * **Dynamic Slideshow Exporter**: Launch interactive, clean, centered slide decks compiled directly from PPTX text analysis including topic overviews, task requirements, and conclusions.
   * **Standalone HTML Deck Download**: Export your summarized meeting deck as an offline-compatible HTML presentation package with fully interactive arrow controls.

---

## 🛠️ Technology Stack
* **Vite v8 & React 19** for blazing-fast Hot Module Replacement and component compiling.
* **TypeScript** for end-to-end data safety.
* **Tailwind CSS v4** styling framework with CSS variables design tokens.
* **JSZip v3** client-side zip parsing utility for zero-backend PPTX extraction.
* **GSAP** for smooth animations and slide transition micro-behaviors.
* **Supabase** auth integrations, backend databases, and real-time synchronizations.

---

## 📂 Project Structure
```
todo-app/
├── src/
│   ├── assets/              # App images and svg icon assets
│   ├── components/          # Persona workspaces and core layouts
│   │   ├── AuthScreen.tsx           # Supabase sign-in/registration screen
│   │   ├── CreativeWorkspace.tsx    # Inspiration boards and visual reference cards
│   │   ├── EisenhowerMatrix.tsx     # Student quadrant selector
│   │   ├── LifestyleWorkspace.tsx   # Habit checklist tracker
│   │   ├── MeetingWorkspace.tsx     # Meeting manager and PPTX summary buttons
│   │   ├── PomodoroTimer.tsx        # Focus block timers
│   │   ├── PresentationExporter.tsx # Slideshow layouts and standalone download compiles
│   │   └── ...
│   ├── hooks/               # Core state managers
│   ├── lib/                 # Utility files
│   │   ├── pptxParser.ts            # Client-side PPTX XML scanner
│   │   ├── supabaseClient.ts        # Database connection configurations
│   │   └── utils.ts                 # Tailwind utility helpers
│   ├── types/               # TypeScript type declaration files
│   │   └── todo.ts                  # Schema and state definitions
│   ├── App.tsx              # Application layout router
│   ├── main.tsx             # Vite mount file
│   └── index.css            # Custom CSS variables, dark mode styling and animations
├── supabase_schema.sql      # Supabase SQL table templates & RLS policies
├── package.json             # Core dependency manifest
└── vite.config.ts           # Development bundler settings
```

---

## 💾 Database Schema (Supabase)

Initialize your tables in the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/editor) using the setup in [supabase_schema.sql](file:///c:/Users/ROG%20%28N3200WS%29/OneDrive/Desktop/todo/todo-app/supabase_schema.sql):

* **`categories`**: Stores user-defined todo groups and color codes.
* **`todos`**: Task records containing status flags, priorities, roadmaps, and JSON subtask checklists.
* **`meetings`**: Organizes conference details, agendas, extracted task lists, and parsed PPTX texts.
* **`habits`**: Daily/weekly habits with logged timestamps.
* **`inspirations`**: Moodboard links, hex strings, colors, quotes, and images.
* **`user_profiles`**: Retains user preferences (active personas).

*Note: All tables have Row Level Security (RLS) policies enabled to guarantee data isolation between users.*

---

## 🚀 Getting Started

### 1. Installation
Clone the workspace and install packages in the `todo-app` folder:
```bash
cd todo-app
npm install
```

### 2. Configure Environment variables
Create a `.env` file in the root of `todo-app/`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
> [!TIP]
> **Guest Mode Override**: If no environment variables are defined, the application features an in-app Settings Panel letting you paste URL and Anon Keys dynamically. These are securely cached locally within your browser (`localStorage`), enabling instant testing without rebuilding code bundles!

### 3. Run the Development Server
Launch the server:
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

### 4. Build for Production
Check types and compile optimized static files:
```bash
npm run build
```
The compiled build output will be stored in `dist/`.
