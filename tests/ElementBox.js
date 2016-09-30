import { expect }                  from 'chai';

import { borders }                 from '../sources/core';

import { createTree, dummyScreen } from './extra/trees';

describe(`ElementBox`, () => {

    it(`should give full width to width-less static elements`, () => {

        var tree = createTree([
            [ `screen`, dummyScreen, [
                [ `main` ]
            ] ]
        ]);

        var elementRect = tree.main.elementBox.get();

        expect(elementRect.left).to.equal(0, `The main element should be fixed to the X-border of its parent (left property)`);
        expect(elementRect.right).to.equal(0, `The main element should be fixed to the X-border of its parent (right property)`);
        expect(elementRect.width).to.equal(100, `The main element should have the width of its parent`);

    });

    it(`should adapt the height of height-less elements to their content heights`, () => {

        var tree = createTree([
            [ `screen`, dummyScreen, [
                [ `main`, { border: borders.simple() }, [
                    [ `sub`, { height: 10 } ]
                ] ]
            ] ]
        ]);

        var elementRect = tree.sub.elementBox.get();

        expect(elementRect.top).to.equal(0, `The sub element should have a position relative to its parent (top property)`);
        expect(elementRect.bottom).to.equal(0, `The sub element should have a position relative to its parent (bottom property)`);
        expect(elementRect.height).to.equal(10, `The sub element should have the height that has been given to it`);

        var elementRect = tree.main.elementBox.get();

        expect(elementRect.top).to.equal(0, `The main element should be at the top of its parent (top property)`);
        expect(elementRect.bottom).to.equal(88, `The main element should be at the top of its parent (bottom property)`);
        expect(elementRect.height).to.equal(12, `The main element should have the size of its child, plus any border`);

    });

    it(`should use the width/height specified in the properties with static elements`, () => {

        var tree = createTree([
            [ `screen`, dummyScreen, [
                [ `main`, { width: 20, height: 20 } ]
            ] ]
        ]);

        var elementRect = tree.main.elementBox.get();

        expect(elementRect.left).to.equal(0, `The main element should be positioned at the left of its parent`);
        expect(elementRect.right).to.equal(80, `The main element should take its width in account when computing its right positioning`);
        expect(elementRect.width).to.equal(20, `The main element should use the width we gave it`);

        expect(elementRect.top).to.equal(0, `The main should be positioned at the top of its parent`);
        expect(elementRect.bottom).to.equal(80, `The main element should take its height in account when computing its bottom positioning`);
        expect(elementRect.height).to.equal(20, `The main element should use the height we gave it`);

    });

    it(`should accept relative sizes when dealing with static elements`, () => {

        var tree = createTree([
            [ `screen`, dummyScreen, [
                [ `main`, { width: `50%` }, [
                    [ `sub`, { width: `50%` } ]
                ] ]
            ] ]
        ]);

        var elementRect = tree.main.elementBox.get();

        expect(elementRect.left).to.equal(0, `The main element should be positioned at the left of its parent`);
        expect(elementRect.right).to.equal(50, `The main element should take its width in account when computing its right positioning`);
        expect(elementRect.width).to.equal(50, `The main element should resolve the width we gave it to 50% the size of its parent`);

        var elementRect = tree.sub.elementBox.get();

        expect(elementRect.left).to.equal(0, `The sub element should be positioned at the left of its parent`);
        expect(elementRect.right).to.equal(25, `The sub element should take its width in account when computing its right positioning`);
        expect(elementRect.width).to.equal(25, `The sub element should resolve the width we gave it to 50% the size of its parent`);

    });

    it(`should ignore positioning attributes when dealing with static and relative elements`, () => {

        var tree = createTree([
            [ `screen`, dummyScreen, [
                [ `main`, { left: 10, right: 10, top: 10, bottom: 10 } ]
            ] ]
        ]);

        var elementRect = tree.main.elementBox.get();

        expect(elementRect.left).to.equal(0, `The main element left positioning should not be affected by its left style property`);
        expect(elementRect.right).to.equal(0, `The main element right positioning should not be affected by its right style property`);
        expect(elementRect.top).to.equal(0, `The main element top positioning should not be affected by its top style property`);
        expect(elementRect.bottom).to.equal(100, `The main element bottom positioning should not be affected by its bottom style property`);

        expect(elementRect.width).to.equal(100, `The main element width should not be affected by its positioning style properties`);
        expect(elementRect.height).to.equal(0, `The main element height should not be affected by its positioning style properties`);

    });

    it(`should accept top/right/bottom/left positioning when dealing with absolute and fixed elements`, () => {

        var tree = createTree([
            [ `screen`, dummyScreen, [
                [ `main`, { position: `absolute`, left: 10, right: 20, top: 30, bottom: 40 } ]
            ] ]
        ]);

        var elementRect = tree.main.elementBox.get();

        expect(elementRect.left).to.equal(10, `The main element left positioning should be affected by its left style property`);
        expect(elementRect.right).to.equal(20, `The main element right positioning should be affected by its right style property`);
        expect(elementRect.top).to.equal(30, `The main element top positioning should be affected by its top style property`);
        expect(elementRect.bottom).to.equal(40, `The main element bottom positioning should be affected by its bottom style property`);

        // Width / Height are tested in another "it" block

    });

    it(`should automatically deduce its width/height when dealing with absolute and fixed elements`, () => {

        var tree = createTree([
            [ `screen`, dummyScreen, [
                [ `main`, { position: `absolute`, left: 10, right: 20, top: 30, bottom: 40 } ]
            ] ]
        ]);

        var elementRect = tree.main.elementBox.get();

        expect(elementRect.width).to.equal(70, `The main element width should be affected by its positioning`);
        expect(elementRect.height).to.equal(30, `The main element height should be affected by its positioning`);

    });

    it(`should put static elements one bottom of the other`, () => {

        var tree = createTree([
            [ `screen`, dummyScreen, [
                [ `main`, {}, [
                    [ `foo`, { height: 10 } ],
                    [ `bar`, { height: 10 } ]
                ] ]
            ] ]
        ]);

        var elementRect = tree.foo.elementBox.get();

        expect(elementRect.top).to.equal(0, `The first element should be at the top (top property)`);
        expect(elementRect.bottom).to.equal(10, `The first element should be at the top (bottom property)`);

        var elementRect = tree.bar.elementBox.get();

        expect(elementRect.top).to.equal(10, `The second element should be at the bottom (top property)`);
        expect(elementRect.bottom).to.equal(0, `The second element should be at the bottom (bottom property)`);

    });

    it(`should compute top/right/bottom/left relative to the content box of its first absolute ascendant`, () => {

        var tree = createTree([
            [ `screen`, dummyScreen, [
                [ `main`, { position: `absolute`, left: 1, right: 1, top: 1, bottom: 1, border: {} }, [
                    [ `sub`, { position: `absolute`, left: 0, right: 0, top: 0, bottom: 0 } ]
                ] ]
            ] ]
        ]);

        var subElementBoxRect = tree.sub.elementBox.get();

        expect(subElementBoxRect.left).to.equal(0, `The element box of the sub element should be at the border of its parent content box (left property)`);
        expect(subElementBoxRect.right).to.equal(0, `The element box of the sub element should be at the border of its parent content box (right property)`);

        expect(subElementBoxRect.top).to.equal(0, `The element box of the sub element should be at the border of its parent content box (top property)`);
        expect(subElementBoxRect.bottom).to.equal(0, `The element box of the sub element should be at the border of its parent content box (bottom property)`);

        var mainWorldElementBoxRect = tree.main.worldElementBox.get();

        expect(mainWorldElementBoxRect.left).to.equal(1, `The world element box of the main element should be at 1 cell from the border (left property)`);
        expect(mainWorldElementBoxRect.right).to.equal(1, `The world element box of the main element should be at 1 cell from the border (right property)`);

        expect(mainWorldElementBoxRect.top).to.equal(1, `The world element box of the main element should be at 1 cell from the border (top property)`);
        expect(mainWorldElementBoxRect.bottom).to.equal(1, `The world element box of the main element should be at 1 cell from the border (bottom property)`);

        var subWorldElementBoxRect = tree.sub.worldElementBox.get();

        expect(subWorldElementBoxRect.left).to.equal(2, `The world element box of the sub element should be at 1+1 cell from the border (left property)`);
        expect(subWorldElementBoxRect.right).to.equal(2, `The world element box of the sub element should be at 1+1 cell from the border (right property)`);

        expect(subWorldElementBoxRect.top).to.equal(2, `The world element box of the sub element should be at 1+1 cell from the border (top property)`);
        expect(subWorldElementBoxRect.bottom).to.equal(2, `The world element box of the sub element should be at 1+1 cell from the border (bottom property)`);

    });

});
