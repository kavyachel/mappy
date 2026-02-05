from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy



app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///./pins.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class test(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)

with app.app_context():
    db.create_all()
    db.session.add(test(name="test pin"))
    db.session.commit()


    tests = test.query.all()
    for t in tests:
        print(t.id, t.name)

# should we make them all the same url

@app.route('/pin', methods=['POST'])
def create_pin(latitude: str, longitude: str):
    # validate
    # add to database
    return

@app.route('/pin/{id}', methods=['GET'])
def retrieve_pin():
    # validate
    # add to database
    return

@app.route('/pins', methods=['GET'])
def retrieve_all_pin(viewport: str):
    # validate
    # add to database
    return

@app.route('/pin/{id}', methods=['DELETE'])
def delete_pin():
    # validate id exists
    # remove from db
    return

if __name__ == '__main__':
    app.run()