import os
import random
from flask import Flask
from flask import render_template
from flask import jsonify
from src.data_processing.matrix_generation import recipe_data


app = Flask(__name__)
app.config['DEBUG'] = os.environ.get('DEBUG', False)
app.jinja_env.add_extension('pyjade.ext.jinja.PyJadeExtension')


@app.route('/')
def index():
    all_recipes = recipe_data(None)
    all_names = [item[0] for item in all_recipes.iterrows()]
    all_ingredients = all_recipes.columns.values

    return render_template('index.jade',
                           ingredients=all_ingredients[5:10],
                           missingIngredients=all_ingredients[0:5],
                           allCocktails=all_names[0:5])


@app.route('/about/')
def about():
    return render_template('about.jade')


def random_drinks(n):
    all_names = [(title, ingredients) for title, ingredients in recipe_data(None).iterrows()]
    selected_drinks = random.sample(all_names, n)
    processed_drinks = []
    for name, ingredient_series in selected_drinks:
        ingredients = []
        ingredient_series.sort()
        for ingredient, amount in ingredient_series.iteritems():
            if amount > 0:
                ingredient = ingredient.replace('_', ' ')
                ingredients.append(ingredient)
        processed_drinks.append({"name": name, "ingredients": ingredients})
    return processed_drinks


@app.route('/search/')
def search():
    return jsonify(drinks=random_drinks(5))


@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.jade'), 404


if __name__ == '__main__':
    app.run(debug=True)
