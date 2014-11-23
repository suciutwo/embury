#!/Users/andrewbackup/Desktop/embury/emburyenv/bin/python

import os
import random
import json
from flask import Flask
from flask import render_template
from flask import jsonify
from flask import request
from src.CocktailDirectory import CocktailDirectory


app = Flask(__name__)
app.config['DEBUG'] = os.environ.get('DEBUG', False)
app.jinja_env.add_extension('pyjade.ext.jinja.PyJadeExtension')

c = CocktailDirectory()

@app.route('/')
def index():
    return render_template('index.jade')


@app.route('/about/')
def about():
    return render_template('about.jade')


@app.route('/ingredients/')
def ingredients():
    return jsonify(ingredients=c.all_ingredients())


@app.route('/search/')
def search():
    owned = request.args.getlist('owned[]')
    forbidden = request.args.getlist('forbidden[]')
    required = request.args.getlist('required[]')
    print owned, forbidden, required
    result = c.search(owned=owned, required=required, forbidden=forbidden)
    number_to_return = min(10, len(result))
    random_selection = random.sample(result, number_to_return)
    return jsonify(cocktails=[s._asdict() for s in random_selection])


@app.route('/suggest/')
def suggest():
    owned = request.args.getlist('owned[]')
    result = c.flexible_search(liquor_on_shelf=owned, allowed_missing_elements=1)
    suggestions = []
    tobuy = "I can't seem to find another drink you could make by buying a single ingredient."
    if result:
        [tobuy, suggestions] = result[0]
        tobuy = ', '.join(tobuy)
        suggestions = [c.cocktail(name)._asdict() for name in suggestions]
    return jsonify(cocktails=suggestions, tobuy=tobuy)


@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.jade'), 404


if __name__ == '__main__':
    app.run(debug=True)
