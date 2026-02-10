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
