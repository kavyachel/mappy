from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from .db import db
from .cache import cache
from .api import api

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///./pins.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['CACHE_TYPE'] = 'SimpleCache'
    app.config['CACHE_DEFAULT_TIMEOUT'] = 30
    
    # CORS config
    CORS(app, resources={
        r"/api/*": {
            "origins": [os.getenv('FRONTEND_URL', 'http://localhost:5173'), "http://127.0.0.1:5173"],
            "methods": ["GET", "POST", "DELETE"],
            "allow_headers": ["Content-Type", "X-API-Key"]
        }
    })
    
    db.init_app(app)
    cache.init_app(app)

    app.register_blueprint(api, url_prefix='/api')
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Endpoint not found"}), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"error": "Method not allowed for this endpoint"}), 405
    
    with app.app_context():
        db.create_all()
    
    return app
