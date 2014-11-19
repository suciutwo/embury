import os, random
from flask import Flask
from flask import render_template
from flask import request
from src.data_processing.matrix_generation import recipe_data


app = Flask(__name__)
app.config['DEBUG'] = os.environ.get('DEBUG', False)
app.jinja_env.add_extension('pyjade.ext.jinja.PyJadeExtension')


@app.route('/')
def index():
    all_recipes = recipe_data(None)
    all_names = [item[0] for item in all_recipes.iterrows()]
    return render_template('index.jade',
                           ingredients=all_names[5:10],
                           missingIngredients=all_names[0:5],
                           allCocktails=all_names)


@app.route('/about/')
def about():
    return render_template('about.jade')


@app.route('/search')
def search():
    print "Searching"
    print request.args


@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.jade'), 404


if __name__ == '__main__':
    app.run(debug=True)
