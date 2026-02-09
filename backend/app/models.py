from .db import db
import json

class Pin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(100), nullable=True)
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)
    tags = db.Column(db.Text, nullable=True)  # Store as JSON string
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    def set_tags(self, tags_list):
        self.tags = json.dumps(tags_list) if tags_list else None

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), unique=True, nullable=False)
    color = db.Column(db.String(7), nullable=False)  # Hex color code