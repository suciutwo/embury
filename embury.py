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
from src.CocktailDirectory import CocktailDirectory


app = Flask(__name__)
app.config['DEBUG'] = os.environ.get('DEBUG', False)
app.jinja_env.add_extension('pyjade.ext.jinja.PyJadeExtension')
app.secret_key = os.environ.get('APP_SECRET_KEY')

c = CocktailDirectory()


@app.route('/login/', methods=['POST'])
def login():
    session['username'] = request.form['username']
    session.permanent = True
    return redirect(url_for('index'))


@app.route('/logout/')
def logout():
    session.pop('username', None)
    session.pop('owned_ingredients', None)
    return redirect(url_for('index'))


@app.route('/')
def index():
    logged_in = 'username' in session
    name = session.get('username', '')
    owned_ingredients = session.get('owned_ingredients', [])
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
        owned += ['lemon twist', 'olive', 'lemon', 'lime', 'orange', 'orange slice', 'lemon wedge', 'cherry',
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
    result = c.flexible_search(owned, required=required, allowed_missing_elements=1)
    suggestions = []
    if result:
        for tobuy, resulting_cocktail_names in result[:3]:
            tobuy = ', '.join(tobuy)
            resulting_cocktails = [c.cocktail(name)._asdict() for name in resulting_cocktail_names]
            suggestions.append({'cocktails':resulting_cocktails, 'tobuy':tobuy})
    else:
        suggestions.append({'tobuy': "I can't seem to find another drink you could make by buying a single ingredient."})
    return jsonify(suggestions=suggestions)


@app.route('/save/')
def save():
    if 'username' in session:
        owned = request.args.getlist('owned[]')
        session['owned_ingredients'] = owned
        return "Saved!"
    else:
        return "No harm no foul, but I didn't save because you're not logged in."


@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.jade'), 404


if __name__ == '__main__':
    app.run(debug=True)
