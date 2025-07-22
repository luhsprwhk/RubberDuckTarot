# Rubber Duck Tarot: Your Personal Perspective Debugger

Rubber Duck Tarot is a unique decision-making tool disguised as divination cards, featuring Rob Chen, a deceased full-stack developer whose soul is now trapped in a rubber duck wearing a wizard hat. Rob's mission from beyond the grave is to help creative people debug their lives and break through mental blocks when they're stuck.

### Core Concept: Debugging for Creative Minds

The project transforms the traditional Lenormand card system into a practical "blocker stopper" tool, inspired by Brian Eno’s Oblique Strategies. Users consult Rob (the duck) when facing creative blocks, tough decisions, or mental loops, receiving randomized perspective prompts that trigger lateral thinking to break thought patterns.

### Why Consult the Duck?

- **Fun-First Strategy:** The primary positioning is "fun over function". The entertainment value drives engagement, while the utility keeps users coming back. Rob's "delightfully absurd authority" – a dead developer trapped in a bath toy giving life advice – is inherently ridiculous yet oddly credible.
- **Perspective Debugging:** This is not fortune-telling; it's decision-making support using proven pattern interrupt techniques. It's a debugging methodology disguised as divination cards, offering a fun alternative to traditional productivity frameworks.
- **Unique Differentiation:** Rubber Duck Tarot sits at the convergence of creative productivity tools, mental health and self-help apps, and humor-driven character brands. It differentiates by offering zero mystical claims, targeting rational individuals, embracing blocks as normal data, and providing quick hits of insight without demanding complex systems or rigid routines. It's designed to be a skeptic-friendly self-care tool.

### Rob's Personality & Charm

Rob brings a unique, self-aware, helpful, slightly absurd, and genuinely useful tone to every interaction. Users can expect a "Magic 8-ball energy" with satisfying anticipation rituals, exaggerated card shuffling, and dramatic pauses before revelations. Rob exhibits unexpectedly human personality quirks, like getting distracted by his reflection, making sarcastic comments, and referencing his "union-mandated afterlife coffee breaks". His backstory involves a "dual failure" in both coding other people's dreams and his own music, leading to his "karmic load balancing" where he helps others avoid similar mistakes.

### Key Features

- **Adaptive Perspective Cards:** The core feature providing context-aware insights based on selected cards and the user's specific problem. The card system acts as a "cognitive constraint," forcing productive cognitive friction and leading to genuine breakthroughs by preventing the AI from simply validating user biases.
- **Intelligence Engine:** Analyzes user patterns over time, offering insights, predicting potential blocks, and providing personalized coaching from Rob.
- **Block Tracker:** Transforms the process of getting stuck from a source of shame into a trackable skill, quantifying self-improvement through pattern recognition and celebrating progress. It offers psychological relief by externalizing problems.
- **Chat with Rob:** An on-demand chat feature where Rob acts as a "pair-programming for your life," providing instant, context-aware advice. He treats feelings like stack-traces and assumptions like legacy code, offering a shameless sounding board for users to externalize their thinking.
- **Notion Export:** A premium feature allowing users to export Rob's action steps directly to Notion, bridging the gap between insight and execution and transforming advice into actionable life infrastructure.
- **Blocker Surfacer:** A psychological discovery mechanism that helps users identify unconscious blocks through card-based pattern recognition and guided dialogue. It uses projective testing and cognitive load optimization to transform vague dissatisfaction into actionable block identification.

### Project Goals

Rubber Duck Tarot is primarily a portfolio project to demonstrate technical and product skills, with the potential to generate side income. The ultimate success includes technical demonstration (full-stack app with AI integration, clean code, good UX), product thinking, and proving the ability to ship a complete product. Monetary success, even with a small number of paying users, validates product-market fit and provides contract leverage.

### Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4
- **AI**: Anthropic Claude API
- **Database**: Drizzle ORM with Supabase (PostgreSQL) for production and SQLite for local development.
- **Authentication**: Supabase Auth
- **Build Tools**: Vite + SWC for a fast and modern development experience.

### Getting Started Locally

#### 1. Clone the Repository

```bash
git clone https://github.com/luhsprwhk/rdt-web.git
cd rdt-web
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Now, open the new `.env` file and add your own keys. You will need:

- `VITE_ANTHROPIC_API_KEY`: Your API key for the Claude AI.
- Supabase credentials (if you want to connect to a live database).

#### 4. Set Up the Database

You can run this project with a local SQLite database or connect to a Supabase instance.

**To use the local SQLite database (recommended for quick setup):**

1.  Make sure your `.env` file has `VITE_DATABASE_TYPE="sqlite"`.
2.  Generate, migrate, and seed the database:

    ```bash
    npm run db:generate
    npm run db:migrate
    npm run db:seed
    ```

**To use Supabase:**

1.  Make sure your `.env` file has `VITE_DATABASE_TYPE="supabase"` and all the necessary Supabase keys.
2.  Seed the remote database:
    ```bash
    npm run supabase:seed
    ```

#### 5. Run the Development Server

```bash
npm run dev
```

The application should now be running on `http://localhost:5173`.
