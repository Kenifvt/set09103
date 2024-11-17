from flask import Flask, abort
app = Flask(__name__)


@app.route('/')
def hello():
    return '<h1>Hello World</h1>'

@app.route('/forc404')
def force404():
    abort(404)

@app.errorhandler(404)
def pag_not_found(error):
    return "Couldn't find the page you requested.", 404

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)