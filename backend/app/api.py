import json
import os
from flask import Blueprint, request, jsonify
from .db import db
from .models import Pin
from .cache import cache

api = Blueprint("api", __name__)

def _round_viewport_key():
    """Cache key that rounds viewport coords to 3 decimal places (~111m)."""
    viewport = request.args.get('viewport', '')
    tag = request.args.get('tag', '')
    try:
        rounded = ','.join(f'{float(c):.3f}' for c in viewport.split(','))
    except ValueError:
        rounded = viewport
    return f'pins:{rounded}:{tag}'

@api.before_request
def require_api_key():
    if request.method == 'OPTIONS':
        return
    key = os.getenv('API_KEY')
    if key and request.headers.get('X-API-Key') != key:
        return {"error": "Unauthorized"}, 401

TAG_COLORS = {
    'Restaurant': '#FF6B6B', 'Cafe': '#8B4513', 'Gas Station': '#FFD93D',
    'Hospital': '#E74C3C', 'School': '#3498DB', 'Grocery': '#27AE60',
    'Gym': '#E67E22', 'Entertainment': '#9B59B6', 'Bar': '#34495E',
    'Parking': '#95A5A6'
}

def normalize_tags(tags_raw):
    """Convert legacy string tags and object tags to consistent {name, color} format."""
    if not tags_raw:
        return []
    tags = json.loads(tags_raw) if isinstance(tags_raw, str) else tags_raw
    result = []
    for tag in tags:
        if isinstance(tag, str):
            result.append({"name": tag, "color": TAG_COLORS.get(tag, "#95A5A6")})
        elif isinstance(tag, dict) and "name" in tag:
            result.append(tag)
    return result

# Create pin
@api.route('/pins', methods=['POST'])
def create_pin():
    data = request.get_json()

    if data.get("lat") is None or data.get("lng") is None:
        return {"error": "Latitude and longitude are required"}, 400

    lat = data.get("lat")
    lng = data.get("lng")

    # Validate lat/lng ranges
    if not isinstance(lat, (int, float)) or not isinstance(lng, (int, float)):
        return {"error": "Latitude and longitude must be numbers"}, 400

    if lat < -90 or lat > 90:
        return {"error": "Latitude must be between -90 and 90"}, 400

    if lng < -180 or lng > 180:
        return {"error": "Longitude must be between -180 and 180"}, 400

    pin = Pin(
        title=data.get("title", "Untitled"),
        description=data.get("description"),
        location=data.get("location"),
        lat=lat,
        lng=lng
    )
    
    # Handle tags
    if data.get("tags"):
        pin.set_tags(data["tags"])

    db.session.add(pin)
    db.session.commit()
    cache.clear()

    # this looks gross - fix later
    return jsonify({
        "id": pin.id,
        "title": pin.title,
        "description": pin.description,
        "location": pin.location,
        "lat": pin.lat,
        "lng": pin.lng,
        "tags": normalize_tags(pin.tags),
        "created_at": pin.created_at.isoformat()
    }), 201

# Retrieve pin by ID
@api.route('/pins/<int:id>', methods=['GET'])
@cache.cached(timeout=30)
def retrieve_pin(id):
    pin = Pin.query.get(id)
    if not pin:
        return {"error": "Pin not found"}, 404
    
    return jsonify({
        "id": pin.id,
        "title": pin.title,
        "description": pin.description,
        "location": pin.location,
        "lat": pin.lat,
        "lng": pin.lng,
        "tags": normalize_tags(pin.tags),
        "created_at": pin.created_at.isoformat()
    }), 200

# Retrieve all pins by viewport, optionally filtered by tag
@api.route('/pins', methods=['GET'])
@cache.cached(timeout=30, make_cache_key=_round_viewport_key)
def retrieve_all_pins():
    viewport = request.args.get('viewport')
    tag = request.args.get('tag')

    query = Pin.query

    # Filter by viewport if provided
    if viewport:
        try:
            bounds = [float(coord) for coord in viewport.split(",")]
            if len(bounds) != 4:
                return {"error": "Viewport must have exactly 4 values: min_lat,min_lon,max_lat,max_lon"}, 400

            query = query.filter(
                Pin.lat >= bounds[0],
                Pin.lat <= bounds[2],
                Pin.lng >= bounds[1],
                Pin.lng <= bounds[3]
            )
        except ValueError:
            return {"error": "Viewport values must be valid numbers"}, 400

    # Filter by tag if provided (tags stored as JSON string)
    if tag:
        query = query.filter(Pin.tags.like(f'%"{tag}"%'))

    pins = query.all()

    return jsonify([{
        "id": pin.id,
        "title": pin.title,
        "description": pin.description,
        "location": pin.location,
        "lat": pin.lat,
        "lng": pin.lng,
        "tags": normalize_tags(pin.tags),
        "created_at": pin.created_at.isoformat()
    } for pin in pins]), 200

# Delete pin by ID
@api.route('/pins/<int:id>', methods=['DELETE'])
def delete_pin(id):
    if not id:
        return {"error": "Pin ID required"}, 400
    pin = Pin.query.get(id)
    if not pin:
        return {"error": "Pin not found"}, 404
    db.session.delete(pin)
    db.session.commit()
    cache.clear()
    return {"message": "Pin deleted"}, 200