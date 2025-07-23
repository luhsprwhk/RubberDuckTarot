# Contributing to Rubber Duck Tarot

First off, thank you for considering contributing! If you've been invited to collaborate on this project, this guide will help you get your development environment set up and running smoothly.

## Getting Started

These steps will guide you through setting up the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/luhsprwhk/rdt-web.git
cd rdt-web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp `${rootDir}/.env.example ${rootDir}/.env
```

Now, open the new `.env` file and add your own keys. You will need:

- `VITE_ANTHROPIC_API_KEY`: Your API key for the Claude AI.
- Supabase credentials.
- `VITE_ENCRYPTION_MASTER_KEY`: A 32-byte hex string used for encrypting sensitive data.
- Any other variables that are required for your specific use case.

### 4. Set Up the Database

**To use Supabase:**

1.  Make sure your `.env` file has all the necessary Supabase keys.
2.  Seed the remote database:
    ```bash
    npm run supabase:seed
    ```

### 5. Run the Development Server

```bash
npm run dev
```

The application should now be running on `http://localhost:5173`.

## Development Workflow

When working on a new feature or bug fix, it's best to create a new branch from `main`:

```bash
git checkout -b your-feature-name
```

## Common Commands

Here are some useful scripts to help you during development:

| Command               | Description                                     |
| --------------------- | ----------------------------------------------- |
| `npm run dev`         | Starts the Vite development server.             |
| `npm run lint`        | Runs ESLint to check for code quality issues.   |
| `npm run format`      | Formats all code with Prettier.                 |
| `npm run test`        | Runs the test suite with Vitest.                |
| `npm run db:generate` | Generates Drizzle ORM migration files.          |
| `npm run db:migrate`  | Applies generated migrations to the database.   |
| `npm run db:studio`   | Opens the Drizzle Studio to view your database. |

## Submitting Changes

Once your work is complete, please open a Pull Request against the `main` branch. Provide a clear description of the changes you've made.
