# 📍 Mappy

A little map app where you can drop pins and tag places you want to remember. Click anywhere on the map, add a title and some tags, and it's saved.

Built with React + Mapbox on the frontend and Flask + SQLite on the backend.

## Getting Started

You'll need Node.js (v18+), Python (v3.9+), and a free Mapbox account.

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Runs on `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Grab a token from [Mapbox](https://account.mapbox.com/access-tokens/) and add it to `.env`:

```
VITE_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
```

Then:

```bash
npm run dev
```

Runs on `http://localhost:5173`.

## API

| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | `/api/pins?viewport=minLat,minLng,maxLat,maxLng` | Get pins in view |
| GET | `/api/pins?viewport=...&tag=Cafe` | Filter by tag |
| GET | `/api/pins/<id>` | Get one pin |
| POST | `/api/pins` | Create a pin |
| DELETE | `/api/pins/<id>` | Delete a pin |

All requests require the `X-API-Key` header (see [Security](#security)).

**Get pins in a viewport:**

```bash
curl "http://localhost:5001/api/pins?viewport=40.70,-74.02,40.72,-73.99" \
  -H "X-API-Key: $API_KEY"
```

**Filter by tag:**

```bash
curl "http://localhost:5001/api/pins?viewport=40.70,-74.02,40.72,-73.99&tag=Cafe" \
  -H "X-API-Key: $API_KEY"
```

**Get a single pin:**

```bash
curl "http://localhost:5001/api/pins/1" \
  -H "X-API-Key: $API_KEY"
```

**Create a pin:**

```bash
curl -X POST http://localhost:5001/api/pins \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"title": "Good coffee spot", "lat": 40.7128, "lng": -74.0060, "tags": [{"name": "Cafe", "color": "#8B4513"}]}'
```

**Delete a pin:**

```bash
curl -X DELETE "http://localhost:5001/api/pins/1" \
  -H "X-API-Key: $API_KEY"
```

## Why I Built It This Way

**JavaScript over TypeScript** - Mapbox GL JS has a pretty rough TypeScript story — the types are community-maintained, the map instance typing is clunky, and a lot of the Mapbox examples and docs are plain JS. For a project this size the overhead of fighting type definitions wasn't worth it. If this grew significantly I'd consider migrating, but right now JS keeps things moving fast.

**Mapbox over Google Maps** - I felt like Mapbox had an easier learning curve compared to it's map framework peers, and I wanted something highly customizable. The free tier (50k loads/month vs Google's limited quota) is also pretty generous.

**SQLite over Postgres** - Zero setup, just a file. Perfect for a small project like this. If this ever needed to scale, I'd switch to Postgres with PostGIS for proper spatial queries.

**Flask over FastAPI** - Flask is mature, battle-tested, and has a massive ecosystem. For a synchronous CRUD API like this there's no real benefit to FastAPI's async support — every request just hits SQLite and returns. Flask also has less magic: no Pydantic models, no dependency injection, just straightforward route handlers. FastAPI's auto-generated docs are nice, but not worth the extra abstractions for a project this small.

**Server-side tag filtering** - Tags are filtered on the backend rather than fetching all pins and filtering client-side. Scales better once you have thousands of pins, and it was a cleaner implementation.

**Cached location** - Your last location is saved to localStorage so the map loads instantly where you left off instead of flying across the country from a default location.

## Database

SQLite with SQLAlchemy ORM. The database is a single file at `backend/instance/pins.db` — no server to install, no config, just works. SQLAlchemy's `create_all()` auto-creates the tables on first run.

### Schema

The `pin` table:

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key, auto-increment |
| `title` | VARCHAR(50) | Pin name |
| `description` | TEXT | Optional |
| `lat` | FLOAT | Latitude |
| `lng` | FLOAT | Longitude |
| `tags` | TEXT | JSON string, e.g. `[{"name":"Cafe","color":"#8B4513"}]` |
| `created_at` | DATETIME | Server default `now()` |

Tags are stored as a JSON string rather than a separate table. This keeps the schema flat and avoids joins for what's essentially metadata. The tradeoff is you can't do efficient tag-specific queries at scale, but for a single-file SQLite database it's fine — a `LIKE '%"tagname"%'` filter works well enough.

## Tags: Current State & Future

Right now tags are split into two types:

- **Built-in tags** (Restaurant, Cafe, Gym, etc.) — curated set with icons, shown in the filter bar
- **Custom tags** — user-created with a chosen color, shown on pin cards and popups but **not** in the filter bar

This is intentional for the current stage. Without user accounts, tags are crowdsourced — if every custom tag showed up in the filter bar, you'd quickly end up with hundreds of one-off tags cluttering the UI. So the filter bar stays clean with just the built-in set, and custom tags are purely descriptive labels on individual pins.

Where this could go with user accounts:
- **Per-user custom tags** that show up in *your* filter bar but not everyone else's
- **Popular tags** that get promoted to the filter bar once they hit a usage threshold
- **Tag management** — edit/delete/merge your custom tags

## Security

The API is protected by a shared API key. Every request must include an `X-API-Key` header — requests without it (or with the wrong key) get a `401 Unauthorized`.

The key lives in `.env` on both sides:

- **Backend** (`backend/.env`): `API_KEY=<key>`
- **Frontend** (`frontend/.env`): `VITE_API_KEY=<key>`

Both `.env` files are gitignored. To set it up, generate a key and add the same value to both:

```bash
# Generate a key
python3 -c "import secrets; print(secrets.token_hex(32))"

# Add to backend/.env
API_KEY=your_generated_key

# Add to frontend/.env
VITE_API_KEY=your_generated_key
```

This means tools like Postman or bare `curl` calls won't work unless they include the header. CORS is also locked down to the frontend origin, so browsers won't even complete cross-origin requests from other domains.

**What this doesn't cover**: This is not authentication — there are no user accounts or sessions. The API key just gates access to the API itself. If this were deployed publicly, you'd want rate limiting and proper auth on top of this.

## Project Structure

```
backend/
  app/
    api.py        # endpoints
    db.py         # database setup
    models.py     # Pin model
  instance/
    pins.db       # the database

frontend/
  src/
    api/          # API calls
    components/   # Map, PinForm, PinCard, PinList, Sidebar, Tag, TagFilter
    constants/    # map config, tag definitions
    utils/        # popup helper
```

## What I would do next 

- [ ] Edit/update pins and delete pins
- [ ] Image uploads on the Pin form
- [ ] Search
- [ ] Shareable pin URLs
