# IT Repair Toolkit — Enterprise IT Dashboard

A full-stack enterprise IT technician platform with repair automation, live monitoring, asset management, ticketing, and AI-powered troubleshooting — all in a dark terminal-style UI.

---

## Features

- **Repair Toolkit** — 12 simulated Windows repair tools (SFC, DISM, DNS Flush, CHKDSK, etc.) with animated terminal output
- **Live Monitoring** — Real-time CPU, RAM, Disk, Network gauges with Recharts graphs
- **Repair Logs** — Full history of all repair runs with PDF/TXT export
- **Asset Tracker** — IT asset inventory with CRUD management
- **Ticket System** — Help desk ticket management with priorities and statuses
- **Tech Notes** — Markdown-style technician notes with tags
- **AI Assistant** — Keyword-based IT troubleshooting chatbot
- **Settings** — Theme, notifications, and security configuration
- **JWT Authentication** — HTTPOnly cookie auth with 8-hour sessions

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- OR Docker & Docker Compose

---

### Option 1: Local Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

**Default credentials:**
- Username: `admin`
- Password: `Admin@2024!`

---

### Option 2: Docker

```bash
# Build and start the container
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

Visit: [http://localhost:3000](http://localhost:3000)

---

### Option 3: Production Build

```bash
npm run build
npm start
```

---

## Configuration

Edit `.env.local` for local development:

```env
JWT_SECRET=your-secret-key-minimum-32-characters
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@2024!
DATA_DIR=./data
```

For Docker, update the `environment` section in `docker-compose.yml`.

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected pages (require auth)
│   │   ├── dashboard/        # Main dashboard with live metrics
│   │   ├── repair/           # Repair toolkit with 12 tools
│   │   ├── monitoring/       # Live system monitoring
│   │   ├── logs/             # Repair history with PDF export
│   │   ├── assets/           # Asset inventory management
│   │   ├── tickets/          # IT help desk tickets
│   │   ├── notes/            # Technician notes
│   │   ├── ai-assistant/     # AI troubleshooting chat
│   │   └── settings/         # App configuration
│   ├── api/                  # REST API routes
│   │   ├── auth/             # Login, logout, verify
│   │   ├── logs/             # Repair logs CRUD
│   │   ├── notes/            # Tech notes CRUD
│   │   ├── assets/           # Asset CRUD
│   │   ├── tickets/          # Ticket CRUD
│   │   └── system/           # System info
│   └── login/                # Login page
├── components/
│   ├── layout/               # Sidebar, Header
│   ├── repair/               # RepairCard component
│   ├── terminal/             # TerminalWindow component
│   ├── ui/                   # Button, Card, Badge, Toast
│   └── providers/            # ThemeProvider
└── lib/
    ├── auth.ts               # JWT auth helpers
    ├── commands.ts           # Repair tool definitions
    ├── db.ts                 # JSON file-based storage
    ├── store.ts              # Zustand global state
    └── utils.ts              # Utility functions
data/                         # JSON storage (auto-created)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS 3 with terminal theme |
| Animation | Framer Motion |
| State | Zustand |
| Auth | JWT (jose) + bcryptjs |
| Storage | JSON files (no database server) |
| Charts | Recharts |
| PDF Export | jsPDF + autotable |
| Icons | Lucide React |

---

## Security Notes

- Change `JWT_SECRET` in production to a random 32+ character string
- Change the default admin password immediately
- The app uses `httpOnly` cookies — not accessible to JavaScript
- All API routes verify the JWT session before processing requests
