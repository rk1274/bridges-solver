from flask import Flask, render_template, jsonify, request
import json
from backend.board.board import Board
from backend.solver.solver import process_and_solve_grid

app = Flask(__name__)

# Load boards
with open('boards.json') as f:
    boards = json.load(f)


@app.route('/')
def index():
    # Load the main page with a dropdown of available boards
    board_names = list(boards.keys())
    return render_template('index.html', board_names=board_names)


@app.route('/load-board', methods=['POST'])
def load_board():
    # API to load a selected board
    data = request.json
    board_name = data['board_name']

    if board_name not in boards:
        return jsonify({"error": "Board not found"}), 404

    # Return the selected board
    board_data = boards[board_name]
    return jsonify(board_data)


@app.route('/solve', methods=['POST'])
def solve():
    # API to solve the selected board (or visualize its steps)
    data = request.json
    board_config = data['board']

    # Solve the board
    (complete, final_grid), process = process_and_solve_grid(board_config)

    matrix = [[0 for x in range(board_config['width'])] for y in range(board_config['height'])]

    for i, row in enumerate(final_grid.grid):
        for j, cell in enumerate(row):
            matrix[i][j] = str(final_grid.grid[i][j])

    # Return the final solved grid for visualization
    # solved_grid = str(final_grid)
    return jsonify({"solved_grid": matrix})


if __name__ == "__main__":
    app.run(debug=True)
