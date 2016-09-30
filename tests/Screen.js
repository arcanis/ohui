import { expect }                  from 'chai';

import { Rect, ansiColors }        from '../sources/core';

import { getDirtyRects }           from './extra/draws';
import { createTree, dummyScreen } from './extra/trees';

describe(`Screen`, () => {

    it(`should only redraw the part of the screen that have changed (changing the background color)`, () => {

        var tree = createTree([
            [ `screen`, dummyScreen, [
                [ `main`, { position: `absolute`, left: 10, top: 20, width: 30, height: 40 } ]
            ] ]
        ]);

        var dirtyRects = getDirtyRects(tree.screen, () => {
            tree.main.setStyleProperty(`color.bg`, ansiColors.RED);
        });

        expect(dirtyRects).to.deep.equal([ Rect.fromJS({ left: 10, top: 20, right: 60, bottom: 40, width: 30, height: 40 }) ]);

    });

    it(`should only redraw the part of the screen that have changed (changing the position)`, () => {

        var tree = createTree([
            [ `screen`, dummyScreen, [
                [ `main`, { position: `absolute`, left: 10, top: 10, width: 10, height: 10 } ]
            ] ]
        ]);

        var dirtyRects = getDirtyRects(tree.screen, () => {
            tree.main.setStyleProperties({ left: 80, top: 80 });
        });

        expect(dirtyRects).to.deep.equal([ Rect.fromJS({ left: 10, top: 10, right: 80, bottom: 80, width: 10, height: 10 }), Rect.fromJS({ left: 80, top: 80, right: 10, bottom: 10, width: 10, height: 10 }) ]);

    });

});
