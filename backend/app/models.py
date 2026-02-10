from .db import db

pin_tags = db.Table('pin_tags',
    db.Column('pin_id', db.Integer, db.ForeignKey('pin.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

class Pin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(100), nullable=True)
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    tags = db.relationship('Tag', secondary=pin_tags, backref='pins')

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), unique=True, nullable=False)
    color = db.Column(db.String(7), nullable=False)
    icon = db.Column(db.String(30), nullable=True)
