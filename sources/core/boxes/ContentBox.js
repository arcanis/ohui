import { Box } from '../boxes/Box';

export class ContentBox extends Box {

    refreshSize(axis) {

        this._rect[axis.size] = this._context[axis.getSize]();

        if (this._element.activeStyle.border) {

            this._rect[axis.size] -= 2;

            if (this._rect[axis.size] < 0) {
                this._rect[axis.size] = 0;
            }

        }

    }

    refreshPosition(axis) {

        let contextBoxRect = this._context[axis.get]();

        this._rect[axis.a] = contextBoxRect[axis.a];
        this._rect[axis.b] = contextBoxRect[axis.b];

        if (this._element.activeStyle.border) {
            this._rect[axis.a] += 1;
            this._rect[axis.b] += 1;
        }

    }

}
