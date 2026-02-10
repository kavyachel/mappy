from flask import request

def serialize_pin(pin):
    return {
        "id": pin.id,
        "title": pin.title,
        "description": pin.description,
        "location": pin.location,
        "lat": pin.lat,
        "lng": pin.lng,
        "tags": [{"name": t.name, "color": t.color, "icon": t.icon} for t in pin.tags],
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
