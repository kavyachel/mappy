from flask import Flask, Blueprint, request
from flask_sqlalchemy import SQLAlchemy
from db import db
from model import Pin

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///./pins.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

api = Blueprint("api", __name__)

@api.route('/pins', methods=['POST'])
def create_pin():
    data = request.get_json()

    if not data["lat"] or data["lon"]:
        # TODO: need to fix
        return {"error": "Latitude and longitude required"}, 400

    pin = Pin(title=data["title"], lat=data["lat"], lon=data["lon"])

    db.session.add(pin)
    db.session.commit()
    return pin, None

@api.route('/pins/{id}', methods=['GET'])
def retrieve_pin():
    # validate
    # add to database
    return

@api.route('/pins', methods=['GET'])
def retrieve_all_pin(viewport: str):
    # validate
    # add to database
    return

@api.route('/pins/{id}', methods=['DELETE'])
def delete_pin():
    # validate id exists
    # remove from db
    return

if __name__ == '__main__':
    app.run()