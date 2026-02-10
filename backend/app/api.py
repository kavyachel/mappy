import os
from flask import Blueprint, request, jsonify
from .db import db
from .models import Pin, Tag
from .helpers import serialize_pin

api = Blueprint("api", __name__)

@api.before_request
def require_api_key():
    if request.method == 'OPTIONS':
        return
    key = os.getenv('API_KEY')
    if key and request.headers.get('X-API-Key') != key:
        return {"error": "Unauthorized"}, 401
    
# --- Pin endpoints ---

@api.route('/pins', methods=['POST'])
def create_pin():
    data = request.get_json()
    lat = data.get("lat")
    lng = data.get("lng")

    if lat is None or lng is None:
        return {"error": "Latitude and longitude are required"}, 400
    if not isinstance(lat, (int, float)) or not isinstance(lng, (int, float)):
        return {"error": "Latitude and longitude must be numbers"}, 400
    if not (-90 <= lat <= 90):
        return {"error": "Latitude must be between -90 and 90"}, 400
    if not (-180 <= lng <= 180):
        return {"error": "Longitude must be between -180 and 180"}, 400

    pin = Pin(
        title=data.get("title", "Untitled"),
        description=data.get("description"),
        location=data.get("location"),
        lat=lat,
        lng=lng
    )
    if data.get("tags"):
        for tag_data in data["tags"]:
            tag = Tag.query.filter_by(name=tag_data["name"]).first()
            if not tag:
                tag = Tag(name=tag_data["name"], color=tag_data.get("color", "#95A5A6"), icon=tag_data.get("icon"))
                db.session.add(tag)
            pin.tags.append(tag)

    db.session.add(pin)
    db.session.commit()

    return jsonify(serialize_pin(pin)), 201

@api.route('/pins/<int:id>', methods=['GET'])
def retrieve_pin(id):
    pin = Pin.query.get(id)
    if not pin:
        return {"error": "Pin not found"}, 404
    return jsonify(serialize_pin(pin)), 200

@api.route('/pins', methods=['GET'])
def retrieve_all_pins():
    viewport = request.args.get('viewport')
    tag = request.args.get('tag')
    query = Pin.query

    if viewport:
        try:
            bounds = [float(c) for c in viewport.split(",")]
            if len(bounds) != 4:
                return {"error": "Viewport must have exactly 4 values: min_lat,min_lon,max_lat,max_lon"}, 400
            query = query.filter(
                Pin.lat >= bounds[0], Pin.lat <= bounds[2],
                Pin.lng >= bounds[1], Pin.lng <= bounds[3]
            )
        except ValueError:
            return {"error": "Viewport values must be valid numbers"}, 400

    if tag:
        query = query.join(Pin.tags).filter(Tag.name == tag)

    return jsonify([serialize_pin(p) for p in query.all()]), 200

# Update a pin
@api.route('/pins/<int:id>', methods=['PUT'])
def update_pin(id):
    pin = Pin.query.get(id)
    if not pin:
        return {"error": "Pin not found"}, 404

    data = request.get_json()
    pin.title = data.get("title", pin.title)
    pin.description = data.get("description", pin.description)
    pin.location = data.get("location", pin.location)
    if data.get("lat") is not None:
        pin.lat = data["lat"]
    if data.get("lng") is not None:
        pin.lng = data["lng"]
    if "tags" in data:
        pin.tags.clear()
        for tag_data in data["tags"]:
            tag = Tag.query.filter_by(name=tag_data["name"]).first()
            if not tag:
                tag = Tag(name=tag_data["name"], color=tag_data.get("color", "#95A5A6"), icon=tag_data.get("icon"))
                db.session.add(tag)
            pin.tags.append(tag)

    db.session.commit()

    return jsonify(serialize_pin(pin)), 200

@api.route('/pins/<int:id>', methods=['DELETE'])
def delete_pin(id):
    pin = Pin.query.get(id)
    if not pin:
        return {"error": "Pin not found"}, 404
    db.session.delete(pin)
    db.session.commit()
    return {"message": "Pin deleted"}, 200

# --- Tag endpoints ---

@api.route('/tags', methods=['POST'])
def create_tag():
    data = request.get_json()
    name = data.get("name")
    color = data.get("color", "#95A5A6")

    if not name:
        return {"error": "Tag name is required"}, 400
    if Tag.query.filter_by(name=name).first():
        return {"error": "Tag already exists"}, 400

    tag = Tag(name=name, color=color, icon=data.get("icon"))
    db.session.add(tag)
    db.session.commit()

    return jsonify({"id": tag.id, "name": tag.name, "color": tag.color, "icon": tag.icon}), 201

@api.route('/tags', methods=['GET'])
def retrieve_all_tags():
    tags = Tag.query.all()
    return jsonify([{"id": t.id, "name": t.name, "color": t.color, "icon": t.icon} for t in tags]), 200
