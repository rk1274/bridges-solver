from flask import Flask, render_template, jsonify, request, session
import json
import sqlite3
from backend.solver.solver import process_and_solve_grid

app = Flask(__name__)
app.secret_key = 'your-secret-key'

DB_FILE = "grids.db"
SEPARATOR = "-"
GLOBAL_BOARD_NAME = "all"
ERRORS = {
    "BOARD_NAME_REQUIRED": {"error": "Invalid input: 'board_name' is required"},
    "BOARD_NOT_FOUND": {"error": "Board not found"}
}

def get_board_names():
    conn = get_db_connection()
    username = session.get('username')

    if username:
        boards = conn.execute(
            "SELECT name FROM grids WHERE username IS NULL OR username = ?", (username,)
        ).fetchall()
    else:
        boards = conn.execute(
            "SELECT name FROM grids WHERE username IS NULL"
        ).fetchall()

    conn.close()

    return [board["name"].rsplit('-', 1)[0] for board in boards]

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/load-board', methods=['POST'])
def load_board():
    data = request.json
    board_name = data['board_name']

    board = find_board(board_name, session.get('username'))
    if board is None:
        return jsonify(ERRORS["BOARD_NOT_FOUND"]), 404

    board_data = {
        "name": board["name"],
        "width": board["width"],
        "height": board["height"],
        "grid": json.loads(board["grid_data"])
    }

    return jsonify(board_data)

def find_board(board_name, username):
    board = get_board_from_db(board_name, GLOBAL_BOARD_NAME)
    if board:
        return board

    if not username:
        return None

    return get_board_from_db(board_name, username)

def get_board_from_db(board_name, board_owner):
    query = "SELECT * FROM grids WHERE name = ?"
    board_full_name = create_board_name(board_name, board_owner)

    with get_db_connection() as conn:
        return conn.execute(query, (board_full_name,)).fetchone()

def create_board_name(board_name, board_owner):
    return f"{board_name}{SEPARATOR}{board_owner}"

@app.route('/solve', methods=['POST'])
def solve():
    """Solve the given board."""
    data = request.json
    board_config = data['board']

    (complete, final_grid), process = process_and_solve_grid(board_config)

    matrix = [[0 for x in range(board_config['width'])] for y in range(board_config['height'])]

    for i, row in enumerate(final_grid.grid):
        for j, cell in enumerate(row):
            matrix[i][j] = str(final_grid.grid[i][j])

    return jsonify({"solved_grid": matrix})

@app.route('/add-board', methods=['POST'])
def add_board():
    """Add a new board to the database."""
    if 'username' not in session:
        return jsonify({"error": "User not logged in"}), 401

    username = session['username']
    data = request.json
    name = create_board_name(data.get('name'),username)

    try:
        conn = sqlite3.connect(DB_FILE)
        conn.execute("""
            INSERT INTO grids (name, width, height, grid_data, username)
            VALUES (?, ?, ?, ?, ?)
        """, (name, data.get('width'), data.get('height'), json.dumps(data.get('grid')), username))
        conn.commit()
        conn.close()
        return jsonify({"message": "Board added successfully!"}), 201

    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Board with the same name already exists"}), 409

    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    """Log in a user."""
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = get_user_from_db(username, password)

    if user is None:
        return jsonify({"error": "Invalid username or password"}), 401

    session['username'] = username
    return jsonify({"message": "Login successful!", "username": username}), 200

def get_user_from_db(username, password):
    with get_db_connection() as conn:
        return conn.execute("SELECT * FROM users WHERE username = ? AND password = ?", (username,password)).fetchone()

@app.route('/logout', methods=['POST'])
def logout():
    """Log out the user."""
    session.pop('username', None)
    return jsonify({"message": "Logged out successfully!"}), 200

@app.route('/sign_up', methods=['POST'])
def sign_up():
    """Sign up a user."""
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    conn = get_db_connection()

    existing_user = conn.execute("SELECT * FROM users WHERE username = ? ", (username,)).fetchone()
    if existing_user:
        conn.close()

        return jsonify({"error": "Username already exists"}), 409

    conn.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))

    conn.commit()
    conn.close()

    session['username'] = username
    return jsonify({"message": "Sign up successful!", "username": username}), 201

@app.route('/get_login_status', methods=['GET'])
def get_login_status():
    """Get current user, if any."""
    username = session.get('username')

    return jsonify({"logged_in_as": username}), 200

@app.route('/get-boards', methods=['GET'])
def get_boards():
    return jsonify(get_board_names())

if __name__ == "__main__":
    app.run(debug=True)
