import os
from flask import Flask, render_template
from src.data_processing.matrix_generation import recipe_data


app = Flask(__name__)
app.config['DEBUG'] = os.environ.get('DEBUG', False)
app.jinja_env.add_extension('pyjade.ext.jinja.PyJadeExtension')


@app.route('/')
def index():
    allrecipes = recipe_data(None)
    allnames = [item[0] for item in allrecipes.iterrows()]
    return render_template('index.jade', cocktailCount=len(allrecipes),
                           allnames=allnames)


if __name__ == '__main__':
    app.run(debug=True)
