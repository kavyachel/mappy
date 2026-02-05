from flask import Flask, jsonify
from .db import db
from .api import api

def create_app():
    # might want to move some stuff over
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///./pins.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)

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
