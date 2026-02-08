import re
from flask import Blueprint, request, jsonify
from .db import db
from .models import Pin, Tag

api = Blueprint("api", __name__)


def serialize_pin(pin):
    return {
        "id": pin.id,
        "title": pin.title,
        "description": pin.description,
        "lat": pin.lat,
        "lng": pin.lng,
        "tags": pin.get_tags(),
        "created_at": pin.created_at.isoformat()
    }

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
        lat=lat,
        lng=lng
    )
    
    # Handle tags
    if data.get("tags"):
        pin.set_tags(data["tags"])

    db.session.add(pin)
    db.session.commit()
    return jsonify(serialize_pin(pin)), 201

# Retrieve pin by ID
@api.route('/pins/<int:id>', methods=['GET'])
def retrieve_pin(id):
    pin = Pin.query.get(id)
    if not pin:
        return {"error": "Pin not found"}, 404
    return jsonify(serialize_pin(pin)), 200

# Retrieve all pins by viewport, optionally filtered by tag
@api.route('/pins', methods=['GET'])
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
    return jsonify([serialize_pin(pin) for pin in pins]), 200

# Delete pin by ID
@api.route('/pins/<int:id>', methods=['DELETE'])
def delete_pin(id):
    pin = Pin.query.get(id)
    if not pin:
        return {"error": "Pin not found"}, 404
    db.session.delete(pin)
    db.session.commit()
    return {"message": "Pin deleted"}, 200


# Get all custom tags
@api.route('/tags', methods=['GET'])
def get_tags():
    tags = Tag.query.all()
    return jsonify([{
        "id": tag.id,
        "name": tag.name,
        "color": tag.color
    } for tag in tags]), 200


# Create a custom tag
@api.route('/tags', methods=['POST'])
def create_tag():
    data = request.get_json()

    name = data.get("name", "").strip()
    color = data.get("color", "").strip()

    # Name validation
    if not name:
        return {"error": "Tag name is required"}, 400

    if len(name) < 2:
        return {"error": "Tag name must be at least 2 characters"}, 400

    if len(name) > 30:
        return {"error": "Tag name must be 30 characters or less"}, 400

    if not re.match(r'^[a-zA-Z0-9 ]+$', name):
        return {"error": "Tag name can only contain letters, numbers, and spaces"}, 400

    # Color validation
    if not color or not re.match(r'^#[0-9A-Fa-f]{6}$', color):
        return {"error": "Valid hex color is required (e.g. #FF6B6B)"}, 400

    # Check if tag already exists (case-insensitive)
    existing = Tag.query.filter(db.func.lower(Tag.name) == name.lower()).first()
    if existing:
        return {"error": "Tag already exists"}, 400

    tag = Tag(name=name, color=color)
    db.session.add(tag)
    db.session.commit()

    return jsonify({
        "id": tag.id,
        "name": tag.name,
        "color": tag.color
    }), 201


# Delete a custom tag
@api.route('/tags/<int:id>', methods=['DELETE'])
def delete_tag(id):
    tag = Tag.query.get(id)
    if not tag:
        return {"error": "Tag not found"}, 404
    db.session.delete(tag)
    db.session.commit()
    return {"message": "Tag deleted"}, 200