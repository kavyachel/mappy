from flask import Blueprint, request, jsonify
from .db import db
from .models import Pin

api = Blueprint("api", __name__)

@api.route('/pins', methods=['POST'])
def create_pin():
    data = request.get_json()

    # maybe improve error handling
    if not data.get("lat") or not data.get("lon"):
        return {"error": "Latitude and longitude required"}, 400

    pin = Pin(title=data["title"], lat=data["lat"], lon=data["lon"])

    db.session.add(pin)
    db.session.commit()
    
    # this looks gross - fix later
    return jsonify({
        "id": pin.id,
        "title": pin.title,
        "lat": pin.lat,
        "lon": pin.lon,
        "created_at": pin.created_at.isoformat()
    }), 201

@api.route('/pins/<int:id>', methods=['GET'])
def retrieve_pin(id):
    pin = Pin.query.get(id)
    if not pin:
        return {"error": "Pin not found"}, 404
    
    return jsonify({
        "id": pin.id,
        "title": pin.title,
        "lat": pin.lat,
        "lon": pin.lon,
        "created_at": pin.created_at.isoformat()
    }), 200

@api.route('/pins', methods=['GET'])
def retrieve_all_pins():
    viewport = request.args.get('viewport')
    if not viewport:
        pins = Pin.query.all()
    else:
        bounds = [float(coord) for coord in viewport.split(",")]
        pins = Pin.query.filter(
            Pin.lat >= bounds[0],
            Pin.lat <= bounds[2],
            Pin.lon >= bounds[1],
            Pin.lon <= bounds[3]
        ).all()
    
    return jsonify([{
        "id": pin.id,
        "title": pin.title,
        "lat": pin.lat,
        "lon": pin.lon,
        "created_at": pin.created_at.isoformat()
    } for pin in pins]), 200

@api.route('/pins/<int:id>', methods=['DELETE'])
def delete_pin(id):
    if not id:
        return {"error": "Pin ID required"}, 400
    pin = Pin.query.get(id)
    if not pin:
        return {"error": "Pin not found"}, 404
    db.session.delete(pin)
    db.session.commit()
    return {"message": "Pin deleted"}, 200