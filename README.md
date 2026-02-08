# Mappy

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

Example:

```bash
curl -X POST http://localhost:5000/api/pins \
  -H "Content-Type: application/json" \
  -d '{"title": "Good coffee spot", "lat": 40.7128, "lng": -74.0060, "tags": ["Cafe"]}'
```

## Why I Built It This Way

**Mapbox over Google Maps** - I felt like Mapbox had an easier learning curve compared to it's map framework peers, and I wanted something highly customizable. The free tier (50k loads/month vs Google's limited quota) is also pretty generous.

**SQLite over Postgres** - Zero setup, just a file. Perfect for a small project like this. If this ever needed to scale, I'd switch to Postgres with PostGIS for proper spatial queries.

**Flask over Django/FastAPI** - It's just a simple API and fairly high performance and I didn't want a ton of boilerplate. If I needed something more robust and scalable, I'd use Django.

**Server-side tag filtering** - Tags are filtered on the backend rather than fetching all pins and filtering client-side. Scales better once you have thousands of pins, and it was a cleaner implementation.

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
    components/   # Map, PinForm, Sidebar, Tag, TagFilter
    constants/    # map config, tag definitions
    utils/        # popup helper
```

## What I would do next 

- [ ] Edit/update pins and delete pins
- [ ] Image uploads on the Pin form
- [ ] Search
- [ ] Shareable pin URLs
