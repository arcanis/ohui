import { isNil, isNumber, isString }      from 'lodash';

import { numberRegexF, percentageRegexF } from '../constants';

import { Box }                            from './Box';

export class ElementBox extends Box {

    refreshSize(axis) {

        switch (this._element.activeStyle.position) {

            case `static`:
            case `relative`: {
                this._refreshSizeStatic(axis);
            } break;

            case `absolute`:
            case `fixed`: {
                this._refreshSizeAbsolute(axis);
            } break;

        }

        let min = this._resolveValue(axis, this._element.activeStyle[axis.minSize]);
        let max = this._resolveValue(axis, this._element.activeStyle[axis.maxSize]);

        if (!isNil(max) && max < this._rect[axis.size])
            this._rect[axis.size] = max;

        if (!isNil(min) && min > this._rect[axis.size]) {
            this._rect[axis.size] = min;
        }

    }

    refreshPosition(axis) {

        switch (this._element.activeStyle.position) {

            case `static`:
            case `relative`: {
                this._refreshPositionStatic(axis);
            } break;

            case `absolute`:
            case `fixed`: {
                this._refreshPositionAbsolute(axis);
            } break;

        }

    }

    _refreshSizeStatic(axis) {

        let size = this._resolveValue(axis, this._element.activeStyle[axis.size]);

        this._rect[axis.size] = size;

    }

    _refreshPositionStatic(axis) {

        this._rect[axis.a] = 0;
        this._rect[axis.b] = this._getBaseSize(axis) - this._rect[axis.size];

        if (axis.a === `top`) {

            let previous = this._element.previousSibling;

            while (previous && !previous.activeStyle.flags.staticPositioning)
                previous = previous.previousNode;

            if (previous) {

                let previousBoxRect = previous.elementBox.getY();
                let top = previousBoxRect.top + previousBoxRect.height;

                this._rect[axis.a] += top;
                this._rect[axis.b] -= top;

            }

        }

    }

    _refreshSizeAbsolute(axis) {

        let size = this._resolveValue(axis, this._element.activeStyle[axis.size]);

        if (!isNil(size)) {

            this._rect[axis.size] = size;

        } else {

            let base = this._getBaseSize(axis);

            let a = this._resolveValue(axis, this._element.activeStyle[axis.a]);
            let b = this._resolveValue(axis, this._element.activeStyle[axis.b]);

            this._rect[axis.size] = base - a - b;

        }

    }

    _refreshPositionAbsolute(axis) {

        let base = this._getBaseSize(axis);
        let size = this._rect[axis.size];

        let a = this._resolveValue(axis, this._element.activeStyle[axis.a]);
        let b = this._resolveValue(axis, this._element.activeStyle[axis.b]);

        if (!isNil(a)) {
            b = base - size - a;
        } else if (!isNil(b)) {
            a = base - size - b;
        } else {
            a = 0;
            b = base - size;
        }

        this._rect[axis.a] = a;
        this._rect[axis.b] = b;

    }

    _resolveValue(axis, value) {

        if (isNil(value))
            return value;

        if (isNumber(value))
            return Math.floor(value);

        if (!isString(value))
            throw new Error(`Invalid value type`);

        if (value === `adaptive`)
            return this._getAdaptiveSize(axis);

        if (numberRegexF.test(value))
            return Math.floor(value.match(numberRegexF)[1]);

        if (percentageRegexF.test(value))
            return Math.floor(value.match(percentageRegexF)[1] * this._getBaseSize(axis) / 100);

        throw new Error(`Invalid value format (is "${value}")`);

    }

    _getAdaptiveSize(axis) {

        let size = this._element[axis.scrollSize];

        if (this._element.activeStyle.border)
            size += 2;

        return size;

    }

    _getBaseSize(axis) {

        let baseElement = this._element.parentNode;

        while (baseElement && baseElement.activeStyle.flags[axis.adaptiveFlag])
            baseElement = baseElement.parentNode;

        if (!baseElement)
            return 0;

        switch (axis.size) {

            case `width`: {
                return baseElement.contentBox.getWidth();
            } break;

            case `height`: {
                return baseElement.contentBox.getHeight();
            } break;

        }

    }

}
