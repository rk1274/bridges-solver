from flask import Flask, render_template, jsonify, request, session, redirect
import json
from backend.board.board import Board
import sqlite3
from backend.solver.solver import process_and_solve_grid

app = Flask(__name__)
app.secret_key = 'your-secret-key'

DB_FILE = "grids.db"

def get_board_names():
    conn = get_db_connection()

    username = session.get('username')

    print(f"Logged-in username: {username}")

    if username:
        boards = conn.execute(
            "SELECT name FROM grids WHERE username IS NULL OR username = ?", (username,)
        ).fetchall()
    else:
        boards = conn.execute(
            "SELECT name FROM grids WHERE username IS NULL"
        ).fetchall()

    conn.close()

    return [board["name"] for board in boards]

def get_db_connection():
    """Connect to the SQLite database."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html', board_names=get_board_names())

@app.route('/load-board', methods=['POST'])
def load_board():
    data = request.json
    board_name = data['board_name']

    conn = get_db_connection()

    board = conn.execute("SELECT * FROM grids WHERE name = ?", (board_name,)).fetchone()
    conn.close()

    if board is None:
        return jsonify({"error": "Board not found"}), 404

    board_data = {
        "name": board["name"],
        "width": board["width"],
        "height": board["height"],
        "grid": json.loads(board["grid_data"])
    }

    return jsonify(board_data)

@app.route('/solve', methods=['POST'])
def solve():
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

    board_name = data.get('name')
    board_width = data.get('width')
    board_height = data.get('height')
    board_matrix = data.get('grid')
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.execute("""
            INSERT INTO grids (name, width, height, grid_data, username)
            VALUES (?, ?, ?, ?, ?)
        """, (board_name, board_width, board_height, json.dumps(board_matrix), username))
        conn.commit()
        conn.close()
        return jsonify({"message": "Board added successfully!"}), 201

    except sqlite3.IntegrityError:
        return jsonify({"error": "Board with the same name already exists"}), 409

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    """Log in a user."""
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    # Check the credentials in the database
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE username = ? AND password = ?", (username, password)).fetchone()
    conn.close()

    if user is None:
        return jsonify({"error": "Invalid username or password"}), 401

    # Store the username in the session
    session['username'] = username
    return jsonify({"message": "Login successful!", "username": username}), 200

@app.route('/logout', methods=['POST'])
def logout():
    """Log out the user."""
    session.pop('username', None)  # Remove the username from the session
    return jsonify({"message": "Logged out successfully!"}), 200

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
