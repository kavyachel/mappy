import json
from flask import request

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

def serialize_pin(pin):
    return {
        "id": pin.id,
        "title": pin.title,
        "description": pin.description,
        "location": pin.location,
        "lat": pin.lat,
        "lng": pin.lng,
        "tags": normalize_tags(pin.tags),
        "created_at": pin.created_at.isoformat()
    }

def round_viewport_key():
    """Cache key that rounds viewport coords to 3 decimal places (~111m)."""
    viewport = request.args.get('viewport', '')
    tag = request.args.get('tag', '')
    try:
        rounded = ','.join(f'{float(c):.3f}' for c in viewport.split(','))
    except ValueError:
        rounded = viewport
    return f'pins:{rounded}:{tag}'
