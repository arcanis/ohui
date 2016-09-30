import { isArray, isFunction, isNull, isPlainObject }      from 'lodash';

import { Block, Screen }                                   from '../../sources/core';

import { createDummyInputStream, createDummyOutputStream } from './streams';

export function dummyScreen() {

    return new Screen({

        stdin: createDummyInputStream(),
        stdout: createDummyOutputStream(),

        resetOnExit: false

    });

}

export function createTree(children, { map = {}, parent = null } = {}) {

    for (let [ name, ... args ] of children) {

        let constructor = Block;
        let style = {};
        let children = [];

        for (let arg of args) {

            if (isFunction(arg)) {
                constructor = arg;
            } else if (isPlainObject(arg)) {
                style = arg;
            } else if (isArray(arg)) {
                children = arg;
            }

        }

        let node = map[name] = new constructor(style);
        node.name = name;

        if (!isNull(parent))
            parent.appendChild(node);

        createTree(children, { map, parent: node });

    }

    return map;

}
