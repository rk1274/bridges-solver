import { checkLoginStatus, login, logout, signup } from './auth.js';
import { loadBoard, solveBoard, makeBoard } from './board.js';

document.getElementById('load-board').addEventListener('click', loadBoard);
document.getElementById('solve-board').addEventListener('click', solveBoard);
document.getElementById('make-board').addEventListener('click', makeBoard);
document.getElementById('login-button')?.addEventListener('click', login);
document.getElementById('signup-button')?.addEventListener('click', signup);
document.getElementById('logout-button')?.addEventListener('click', logout);

// Check login status on load
window.onload = checkLoginStatus;
