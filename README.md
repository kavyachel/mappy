# 🗺️ Mappy

A little map app where you can drop pins and tag places you want to remember. Click anywhere on the map, add a title and some tags, and it's saved. You can edit and delete pins too, filter by tag, and the sidebar stays in sync with whatever's on screen.

Built with React + Mapbox on the frontend and Flask + SQLite on the backend.

## Getting Started

You'll need Node.js (v18+), Python (v3.9+), and a free Mapbox account.
### Clone the Repository
``` bash
git clone https://github.com/kavyachel/mappy.git
```

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip3 install -r requirements.txt

# Generate a local API key
python3 -c "import secrets; print(secrets.token_hex(32))"
```
Create a backend/.env file and paste your generated key (this is the same as `VITE_API_KEY` from the Frontend section):

```bash
cp .env.example .env
API_KEY=your_generated_key
python3 run.py
```
Runs on `http://localhost:5001`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Grab a token from [Mapbox](https://account.mapbox.com/access-tokens/) and add it to `.env`:

```
VITE_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
VITE_API_KEY=your_generated_key
```

Then:

```bash
npm run dev
```

Runs on `http://localhost:5173`.

## Security

The API is protected by a shared API key. Every request needs an `X-API-Key` header, and without it (or with the wrong key) you get a `401`. CORS is locked to the frontend origin, and both `.env` files are gitignored.

Right now, we aren't using a managed "shared secret" or a database of keys. We are simply using a locally-generated string to authorize requests via the X-API-Key header. This is a temporary measure to ensure the plumbing works without the overhead of a full identity provider.

For a production environment, we would move away from manual generation and use:

- **Managed Secrets:** AWS Secrets Manager or Vault to handle keys.

- **Real Auth:** A proper OIDC/OAuth2 provider (like Clerk or Auth0) to issue individual user tokens (JWTs) instead of a single static key.

- **Automated Rotation:** Automatic key cycling so they aren't hardcoded in environments indefinitely.


## How It's Built

### Frontend

Single-page React app with Vite. There's no router, the whole UI is just the map and a sidebar. All state lives in `App.jsx` and flows down through props. I avoided Redux/global state management libraries. Prop drilling was cleaner and more predictable for an app of this size.

```
App (state owner)
├── Sidebar (layout shell)
│   ├── PinForm (create / edit)
│   ├── TagFilter (filter bar)
│   └── PinList → PinCard (pin listing)
├── Map (Mapbox GL JS)
└── AlertProvider (toast context)
```

- **The Mapbox-React Bridge**: Mapbox event handlers don't naturally "see" React state updates. To solve this, I used Refs to store callback props. This lets the map listeners stay mounted (efficient) while still accessing the freshest state (accurate).
- **Unified Popup Logic**: Opening a pin happens from two places: the Sidebar and the Map. To avoid 40+ lines of redundant code, I created a showPinPopup helper inside the Map component. It handles the fly-to animation, opening the popup, and the fly-back logic when closed.
- **State Syncing**: I kept the data flow "lazy" to avoid complex refresh logic:
  * Creates/Edits: Closing the form resets the location, which automatically triggers a pin reload.
  * Deletions: Uses a simple refreshKey (counter) to force a quick update when a pin is removed.

### Backend

- **Flask + SQLAlchemy + SQLite**: The API is one blueprint with standard REST endpoints. I didn't add a service layer or repository pattern. The route handlers just talk directly to the models, which is the right level of abstraction for two tables.

- **Caching uses Flask-Caching with an in-memory dict**: Viewport query cache keys are rounded to 3 decimal places (~111m), so nearby pans usually hit cache. Any write clears the whole cache. It's a blunt strategy, but with a single-process SQLite backend there's no real benefit to doing anything smarter.

- **Serialized Tag Storage**: Tags are stored as a JSON string on the Pin row rather than in a normalized join table. That means tag filtering uses `LIKE '%"tagname"%'` which won't scale to millions of rows, but it avoids the complexity of a many-to-many relationship for what's essentially just a label. A `normalize_tags` helper handles backwards compatibility with an older format where tags were just strings instead of objects.

## API

| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | `/api/pins?viewport=s,w,n,e` | Pins in viewport bounds |
| GET | `/api/pins?viewport=...&tag=Cafe` | Filter by tag |
| GET | `/api/pins/<id>` | Single pin |
| POST | `/api/pins` | Create pin |
| PUT | `/api/pins/<id>` | Update pin |
| DELETE | `/api/pins/<id>` | Delete pin |
| GET | `/api/tags` | All tags |
| POST | `/api/tags` | Create tag |

All requests need an `X-API-Key` header (see [Security](#security)).

```bash
# Get pins in a viewport
curl "http://localhost:5001/api/pins?viewport=40.70,-74.02,40.72,-73.99" \
  -H "X-API-Key: $API_KEY"

# Create a pin
curl -X POST http://localhost:5001/api/pins \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"title": "Good coffee", "lat": 40.7128, "lng": -74.006, "tags": [{"name": "Cafe", "color": "#8B4513"}]}'

# Update a pin
curl -X PUT http://localhost:5001/api/pins/1 \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"title": "Great coffee", "tags": [{"name": "Cafe", "color": "#8B4513"}]}'

# Delete a pin
curl -X DELETE http://localhost:5001/api/pins/1 \
  -H "X-API-Key: $API_KEY"
```

## Why I Built It This Way

**JavaScript over TypeScript**: Mapbox GL JS has a pretty rough TypeScript story. The types are community-maintained, the map instance typing is clunky, and most of the Mapbox docs and examples are plain JS. For a project this size the overhead of fighting type definitions wasn't worth it. If this grew significantly I'd consider migrating, but right now JS keeps things moving fast.

**Mapbox over Google Maps**: I felt like Mapbox had an easier learning curve, and I wanted something highly customizable. The free tier is generous (50k loads/month vs Google's limited quota), and the style editor made it easy to get a custom map look without writing CSS hacks.

**SQLite over Postgres**: Zero setup, just a file. No server process to manage. If this ever needed to scale I'd switch to Postgres with PostGIS for proper spatial indexing. Right now viewport queries are just `WHERE lat BETWEEN x AND y` which scans the table, but it's fast enough for thousands of pins.

**Flask over FastAPI**: Every request just hits SQLite and returns. There's no I/O concurrency to benefit from async. Flask has less magic, no Pydantic models, no dependency injection, just route handlers. FastAPI's auto-generated docs are nice, but not worth the extra abstractions for a project this small.

**JSON tags instead of a join table**: Tags live as a JSON string on the Pin row: `[{"name":"Cafe","color":"#8B4513"}]`. That avoids a `pin_tags` join table and the N+1 problem that comes with it. The tradeoff is tag queries use `LIKE` matching, which won't scale to millions of rows. For a personal map app the simplicity wins.

**Viewport-scoped queries**: Pins are only fetched for the visible map area, not all at once. The sidebar list and markers always reflect what's on screen. The frontend re-fetches on every `moveend` event, and the backend caches responses by rounded viewport coordinates so rapid panning doesn't hammer the database.

**Cached location**: Your last location is saved to `localStorage` so the map loads instantly where you left off instead of flying across the country from a default location while waiting for the geolocation API. If geolocation fails entirely, it falls back to NYC.

**Server-side tag filtering**: Tags are filtered on the backend rather than fetching everything and filtering client-side. Scales better once you have a lot of pins. The filter bar only shows built-in tags. Custom tags are descriptive labels on individual pins but don't clutter the filter UI. Without user accounts, if every custom tag showed up in the filter bar you'd quickly have hundreds of one-off tags.

## Database

SQLite with SQLAlchemy ORM. The database is a single file at `backend/instance/pins.db`. Tables are auto-created on first run.

**`pin`**

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key, auto-increment |
| title | VARCHAR(50) | Required |
| description | TEXT | Optional |
| location | VARCHAR(100) | Reverse-geocoded address |
| lat | FLOAT | Latitude |
| lng | FLOAT | Longitude |
| tags | TEXT | JSON string: `[{"name":"Cafe","color":"#8B4513"}]` |
| created_at | DATETIME | Server default |

**`tag`**

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key |
| name | VARCHAR(20) | Unique |
| color | VARCHAR(7) | Hex color |
| icon | VARCHAR(30) | Optional icon key |

10 built-in tags are seeded on first run. Custom tags can be created from the pin form.

## Project Structure

```
backend/
  app/
    __init__.py    # Flask app factory, CORS, tag seeding
    api.py         # REST endpoints
    models.py      # Pin + Tag models
    db.py          # SQLAlchemy setup
    cache.py       # Flask-Caching setup
    helpers.py     # Serialization, cache keys, tag normalization
  run.py           # Entry point

frontend/
  src/
    api/           # API client (pins, tags, mapbox geocoding)
    components/    # Map, Sidebar, PinForm, PinCard, PinList, Tag, TagFilter, Alert
    constants/     # Map config, tag icon mapping, US state abbreviations
    utils/         # Popup HTML builder, location abbreviation
    App.jsx        # Root component, state management
    App.css        # Global styles + shared button system
```

## What I'd Do Next

- [ ] Image uploads on pins
- [ ] Search by title or location
- [ ] Shareable pin URLs
- [ ] User accounts with per-user pins and custom tag management
