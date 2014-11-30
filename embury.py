#!/Users/andrewbackup/Desktop/embury/emburyenv/bin/python

import os
import json
import random
from flask import Flask
from flask import jsonify
from flask import redirect
from flask import render_template
from flask import request
from flask import session
from flask import url_for
from flask.ext.sqlalchemy import SQLAlchemy
from src.CocktailDirectory import CocktailDirectory


app = Flask(__name__)
app.config['DEBUG'] = os.environ.get('DEBUG', False)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
app.jinja_env.add_extension('pyjade.ext.jinja.PyJadeExtension')
app.secret_key = os.environ.get('APP_SECRET_KEY')
db = SQLAlchemy(app)


class UserDrink(db.Model):
    __tablename__ = "user_drink"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String())
    drink = db.Column(db.String())

    def __init__(self, username, drink):
        self.username = username
        self.drink = drink

    def __repr__(self):
        return '<id {}>'.format(self.id)


c = CocktailDirectory()


@app.route('/login/', methods=['POST'])
def login():
    session['username'] = request.form['username']
    session.permanent = True
    return redirect(url_for('index'))


@app.route('/logout/')
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))


@app.route('/')
def index():
    logged_in = 'username' in session
    name = session.get('username', '')
    owned_ingredients = []
    if logged_in:
        owned_ingredients = UserDrink.query.filter_by(username=name).all()
        owned_ingredients = [i.drink for i in owned_ingredients]
        owned_ingredients.sort()
        owned_ingredients = json.dumps(owned_ingredients)
    return render_template('index.jade', logged_in=logged_in, owned_ingredients=owned_ingredients, name=name)


@app.route('/about/')
def about():
    logged_in = 'username' in session
    return render_template('about.jade', logged_in=logged_in)


@app.route('/ingredients/')
def ingredients():
    return jsonify(ingredients=c.all_ingredients())


def parse_request():
    owned = request.args.getlist('owned[]')
    if owned:
        # Partial list of garnishes
        owned += ['lemon twist', 'olive', 'lemon', 'lime', 'orange', 'orange slice', 'lemon wedge', 'cherry', 'green cherry'
                  'lemon slice', 'mint leaf']
        # Partial list of home cooking ingredients
        owned += ['sugar', 'molasses', 'cream', 'egg white', 'egg', 'food coloring', 'milk', 'water', 'ice', 'syrup',
                  'maple syrup']
    forbidden = request.args.getlist('forbidden[]')
    required = request.args.getlist('required[]')
    return forbidden, owned, required


@app.route('/search/')
def search():
    forbidden, owned, required = parse_request()
    result = c.search(owned=owned, required=required, forbidden=forbidden)
    number_to_return = min(10, len(result))
    random_selection = random.sample(result, number_to_return)
    return jsonify(cocktails=[s._asdict() for s in random_selection])


@app.route('/suggest/')
def suggest():
    forbidden, owned, required = parse_request()
    for i in xrange(1, 4):
        result = c.flexible_search(owned, required=required, allowed_missing_elements=i)
        if len(result) >= 2 and len(result[0]) >= 3:
            break
    suggestions = []
    if result:
        for tobuy, resulting_cocktail_names in result[:3]:
            tobuy = ', '.join(tobuy)
            resulting_cocktails = [c.cocktail(name)._asdict() for name in resulting_cocktail_names]
            suggestions.append({'cocktails':resulting_cocktails, 'tobuy':tobuy})
    else:
        suggestions.append({'tobuy': ""})
    return jsonify(suggestions=suggestions)


@app.route('/save/')
def save():
    if 'username' in session:
        name = session['username']
        db_items = UserDrink.query.filter_by(username=name).all()
        already_in = {db_item.drink for db_item in db_items}
        current_ingredients = request.args.getlist('owned[]')
        current_ingredients = {item for item in current_ingredients}
        to_create = current_ingredients - already_in
        to_delete = already_in - current_ingredients
        [db.session.delete(item) for item in db_items if item.drink in to_delete]
        [db.session.add(UserDrink(name, ingredient)) for ingredient in to_create]
        db.session.commit()
        return "Saved!"
    else:
        return "No harm no foul, but I didn't save because you're not logged in."


@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.jade'), 404


if __name__ == '__main__':
    app.run(debug=True)
