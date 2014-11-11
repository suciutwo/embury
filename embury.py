from flask import Flask, render_template
from src.data_processing.matrix_generation import recipe_data


app = Flask(__name__)
app.jinja_env.add_extension('pyjade.ext.jinja.PyJadeExtension')


@app.route('/')
def index():
    allrecipes = recipe_data(None)
    print len(allrecipes)
    return render_template('index.jade', cocktailCount=len(allrecipes))

if __name__ == '__main__':
    app.run(debug=True)
