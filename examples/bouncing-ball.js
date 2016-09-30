import { Screen, Block, borders } from '../sources/core';
import { Text }                   from '../sources/elements';

let screen = new Screen();

let main = new Block({ position: `absolute`, left: 0, top: 0, right: 0, bottom: 0, border: borders.strong() });
screen.appendChild(main);

let ball = new Block({ position: `absolute`, left: 0, top: 0, width: 6, height: 4, border: borders.simple(), ch: `#` });
main.appendChild(ball);

(function run(dx, dy) {

    let left = ball.activeStyle.left + dx;
    let top = ball.activeStyle.top + dy;

    ball.setStyleProperties({ left, top });

    let elementRect = ball.elementBox.get();

    if (elementRect.left <= 0)
        dx = +1;
    else if (elementRect.right <= 0)
        dx = -1;

    if (elementRect.top <= 0)
        dy = +1;
    else if (elementRect.bottom <= 0)
        dy = -1;

    setTimeout(() => run(dx, dy), 1000 / 60);

}(1, 1))
