import { Screen, Block, borders } from './sources/core';
import { Text }                   from './sources/elements';

let screen = new Screen();

let left = new Block({ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', border: borders.strong() });
screen.appendChild(left);

let right = new Block({ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', border: borders.strong() });
screen.appendChild(right);

let text = new Text();
left.appendChild(text);

let logs = new Text();
right.appendChild(logs);

(function run(t) {
    setTimeout(() => run(t + 1), 500);
    text.innerText = `Hello, hello, hello! #${t}`;
}(1))
