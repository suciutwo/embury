import os
from flask import Flask
from flask import render_template
from flask import jsonify
from src.CocktailDirectory import CocktailDirectory


app = Flask(__name__)
app.config['DEBUG'] = os.environ.get('DEBUG', False)
app.jinja_env.add_extension('pyjade.ext.jinja.PyJadeExtension')

c = CocktailDirectory()

@app.route('/')
def index():
    all_ingredients = c.all_ingredients()
    all_names = [name for name, recipe in c.search()]
    return render_template('index.jade',
                           ingredients=all_ingredients[5:10],
                           missingIngredients=all_ingredients[0:5],
                           allCocktails=all_names[0:5])


@app.route('/about/')
def about():
    return render_template('about.jade')


@app.route('/search/')
def search():
    random_selection = c.random_drinks(5)
    processed_drinks = []
    for name, recipe in random_selection:
        ingredients = [ingredient_name for ingredient_name, amount in recipe]
        processed_drinks.append({"name": name, "ingredients": ingredients})
    return jsonify(drinks=processed_drinks)


@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.jade'), 404


if __name__ == '__main__':
    app.run(debug=True)
