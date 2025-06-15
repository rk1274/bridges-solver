import { renderLoad } from './load.js';
import { renderMake } from './make.js';
import './auth.js';

document.getElementById('load-button').addEventListener('click', renderLoad);

document.getElementById('make-button').addEventListener('click', renderMake);

document.getElementById('home-button').addEventListener('click', () => {
     document.getElementById('make-container').classList.add('hidden');
     document.getElementById('solve-container').classList.add('hidden');
     document.getElementById('puzzle-bg').classList.remove('hidden');

})