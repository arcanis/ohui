import { isNull } from 'lodash';

import { Rect }   from '../Rect';

var axisSet = {
    x: { get: 'getX', getSize: 'getWidth', a: 'left', b: 'right', size: 'width', minSize: 'minWidth', maxSize: 'maxWidth', scrollSize: 'scrollWidth', scrollPosition: 'scrollLeft', adaptiveFlag: 'hasAdaptativeWidth' },
    y: { get: 'getY', getSize: 'getHeight', a: 'top', b: 'bottom', size: 'height', minSize: 'minHeight', maxSize: 'maxHeight', scrollSize: 'scrollHeight', scrollPosition: 'scrollTop', adaptiveFlag: 'hasAdaptativeHeight' }
};

export class Box {

    constructor(context) {

        this._dirtyX = true;
        this._dirtyY = true;

        this._context = context;

        this._rect = new Rect();
        this._stub = null;

        this._invalidateList = [];

        if (this._context instanceof Box) {

            this._context._invalidateList.push(this);
            this._element = this._context._element;

        } else {

            this._element = this._context;

        }

    }

    setStub(stub) {

        if (!isNull(stub) && !(stub instanceof Rect))
            throw new Error(`Invalid stub`);

        this._stub = stub;
        this.invalidate();

    }

    invalidate(invalidateX = true, invalidateY = true) {

        if (!invalidateX && !invalidateY)
            return this;

        if (invalidateX)
            this._dirtyX = true;

        if (invalidateY)
            this._dirtyY = true;

        this._invalidateList.forEach(box => {
            box.invalidate(invalidateX, invalidateY);
        });

        return this;

    }

    get(refreshX = true, refreshY = true) {

        if (!isNull(this._stub))
            return this._stub;

        if (refreshX)
            this.getX();

        if (refreshY)
            this.getY();

        return this._rect;

    }

    getX() {

        if (!isNull(this._stub))
            return this._stub;

        if (this._dirtyX) {
            this.refreshSize(axisSet.x);
            this.refreshPosition(axisSet.x);
            this._dirtyX = false;
        }

        return this._rect;

    }

    getY() {

        if (!isNull(this._stub))
            return this._stub;

        if (this._dirtyY) {
            this.refreshSize(axisSet.y);
            this.refreshPosition(axisSet.y);
            this._dirtyY = false;
        }

        return this._rect;

    }

    getWidth() {

        if (!isNull(this._stub))
            return this._stub;

        if (this._dirtyX)
            this.refreshSize(axisSet.x);

        return this._rect.width;

    }

    getHeight() {

        if (!isNull(this._stub))
            return this._stub;

        if (this._dirtyY)
            this.refreshSize(axisSet.y);

        return this._rect.height;

    }

    toRect() {

        return new Rect(this.get());

    }

};
