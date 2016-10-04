import extend               from 'extend';
import { isNull }           from 'lodash';

import { ClipBox }          from './boxes/ClipBox';
import { ContentBox }       from './boxes/ContentBox';
import { ElementBox }       from './boxes/ElementBox';
import { ScrollBox }        from './boxes/ScrollBox';
import { WorldBox }         from './boxes/WorldBox';
import { KeySequence }      from './utilities/KeySequence';

import { Event }            from './Event';
import { Rect }             from './Rect';
import { percentageRegexF } from './constants';

let elementUniqueId = 0;

export class Element {

    /**
     */

    constructor(style = {}) {

        this.name = null;
        this.id = ++elementUniqueId;

        this.style = extend(true, { position: `static`, width: `auto`, height: `auto`, backgroundCharacter: ` ` }, style);
        this.activeStyle = { flags: {} };

        this.screenNode = null;
        this.parentNode = null;

        this.previousSibling = null;
        this.nextSibling = null;

        this.childNodes = [];

        this.scrollTop = 0;
        this.scrollLeft = 0;

        this.scrollWidth = 0;
        this.scrollHeight = 0;

        this.caret = null;

        this.elementBox = new ElementBox(this);
        this.contentBox = new ContentBox(this.elementBox);

        this.scrollElementBox = new ScrollBox(this.elementBox);
        this.scrollContentBox = new ScrollBox(this.contentBox);

        this.worldElementBox = new WorldBox(this.scrollElementBox);
        this.worldContentBox = new WorldBox(this.scrollContentBox);

        this.clipElementBox = new ClipBox(this.worldElementBox);
        this.clipContentBox = new ClipBox(this.worldContentBox);

        this._events = {};

        this.declareEvent(`data`);
        this.declareEvent(`scroll`);
        this.declareEvent(`click`);
        this.declareEvent(`focus`);
        this.declareEvent(`blur`);

        this.refreshActiveStyles();

        Object.defineProperty(this, `scrollWidth`, {

            get: () => this.childNodes.reduce((max, element) => {

                if (!element.activeStyle.flags.staticPositioning)
                    return max;

                let childWidth = element.elementBox.getWidth();
                return Math.max(max, childWidth);

            }, 0)

        });

        Object.defineProperty(this, `scrollHeight`, {

            get: () => this.childNodes.reduce((sum, child) => {

                if (!child.activeStyle.flags.staticPositioning)
                    return sum;

                let childHeight = child.contentBox.getHeight();
                return sum + childHeight;

            }, 0)

        });

    }

    /**
     */

    toString() {

        let name = !isNull(this.name) ? this.name : `???`;
        let id = this.id;

        return `<${name}#${id}>`;

    }

    /**
     */

    setStyleProperty(name, value) {

        let namespaces = name.split(/\./g);
        let property = namespaces.shift();

        let what = this.style;

        while (namespaces.length > 0) {

            let namespace = namespaces.shift();

            if (typeof what[namespace] !== `object` || what[namespace] === null)
                what[namespace] = {};

            what = what[namespace];

        }

        what[property] = value;

        this.refreshActiveStyles();

    }

    /**
     */

    setStyleProperties(style) {

        extend(true, this.style, style);

        this.refreshActiveStyles();

    }

    /**
     * Add an element at the end of the childNodes array.
     *
     * If the child is already the child of another element, it will be removed from that other element before adding it to the new parent.
     */

    appendChild(element) {

        if (element.parentNode)
            element.parentNode.removeChild(element);

        return this.applyElementBoxInvalidatingActions(true, true, () => {

            element.screenNode = this.screenNode;
            element.parentNode = this;

            element._cascadeScreenNode();

            if (this.childNodes.length !== 0) {
                element.previousSibling = this.childNodes[this.childNodes.length - 1];
                this.childNodes[this.childNodes.length - 1].nextSibling = element;
            }

            this.childNodes.push(element);

            if (!this.firstChild)
                this.firstChild = element;

            this.lastChild = element;

            if (this.screenNode) {
                this.screenNode.invalidateNodeList();
            }

        });

    }

    /**
     * Remove an element from the childNodes array.
     */

    removeChild(element) {

        if (element.parentNode !== this)
            return this;

        return this.applyElementBoxInvalidatingActions(true, true, () => {

            let screenNode = element.screenNode;

            element.elementBox.invalidate();

            if (this.lastChild === element)
                this.lastChild = element.previousSibling;

            if (this.firstChild === element)
                this.firstChild = element.nextSibling;

            if (element.previousSibling)
                element.previousSibling.nextSibling = element.nextSibling;

            if (element.nextSibling)
                element.nextSibling.previousSibling = element.previousSibling;

            element.screenNode = null;
            element.parentNode = null;

            element._cascadeScreenNode();

            element.previousSibling = null;
            element.nextSibling = null;

            let index = this.childNodes.indexOf(element);
            this.childNodes.splice(index, 1);

            if (screenNode) {
                screenNode.invalidateNodeList();
            }

        });

    }

    /**
    */

    scrollIntoView(anchor) {

        if (!this.parentNode)
            return this;

        let elementBox = this.elementBox.get();
        let top = elementBox.top, height = elementBox.height;

        let parentScrollTop = this.parentNode.scrollTop;
        let parentHeight = this.parentNode.contentBox.get().height;

        if (top >= parentScrollTop && top + height < parentScrollTop + parentHeight)
            return this;

        if (typeof anchor === `undefined`) {
            if (top <= parentScrollTop) {
                anchor = `top`;
            } else {
                anchor = `bottom`;
            }
        }

        switch (anchor) {

            case `top`:
                this.parentNode.scrollTo(top);
            break ;

            case `bottom`:
                this.parentNode.scrollTo(top + height - parentHeight);
            break ;

            default:
            throw new Error(`Invalid scroll anchor`);

        }

        return this;

    }

    /**
     */

    focus() {

        if (!this.screenNode || this.screenNode.activeElement === this)
            return this;

        this.screenNode.activeElement.blur();

        this.screenNode.activeElement = this;
        this.refreshActiveStyles();

        let event = new Event(`focus`, { target: this, cancelable: false });
        this.dispatchEvent(event);

        return this;

    }

    /**
     */

    blur() {

        if (!this.screenNode || this.screenNode.activeElement !== this)
            return this;

        this.screenNode.activeElement = this.screenNode;
        this.refreshActiveStyles();

        let event = new Event(`blur`, { target: this, cancelable: false });
        this.dispatchEvent(event);

        return this;

    }

    /**
     */

    declareEvent(name) {

        if (this._events[name])
            throw new Error(`Event already declared: ` + name);

        this._events[name] = { userActions: [], defaultActions: [] };

        return this;

    }

    /**
     */

    dispatchEvent(event) {

        let name = event.name;

        if (!this._events[name])
            throw new Error(`Invalid event name "${name}"`);

        let listeners = this._events[name];

        event.currentTarget = this;

        for (let t = 0, T = listeners.userActions.length; t < T; ++t)
            listeners.userActions[t].call(this, event);

        for (let t = 0, T = listeners.defaultActions.length; t < T && !event.isDefaultPrevented(); ++t)
            listeners.defaultActions[t].call(this, event);

        return this;

    }

    /**
     */

    addEventListener(name, callback, { isDefaultAction } = {}) {

        if (!this._events[name])
            throw new Error(`Invalid event name "${name}"`);

        if (isDefaultAction) {
            this._events[name].defaultActions.unshift(callback);
        } else {
            this._events[name].userActions.push(callback);
        }

        return this;

    }

    /**
     */

    addShortcutListener(descriptor, callback, options) {

        let sequence = new KeySequence(descriptor);

        this.addEventListener(`data`, e => {

            if (!e.key)
                return;

            if (!sequence.match(e.key))
                return;

            callback.call(this, e);

        }, options);

        return this;

    }

    /**
     */

    applyElementBoxInvalidatingActions(invalidateX, invalidateY, invalidatingActionsCallback) {

        // "topMostInvalidation" contains a reference to the top-most invalidated element
        // "invalidatedElement" contains the full set of invalidated elements

        let topMostInvalidation = this;
        let invalidatedElements = new Set();

        // First step, we push the element itself

        invalidatedElements.add(this);

        // Second step, we push every direct flexible-size parents of the element, because their boxes might change because of us

        for (let element = this; element; element = element.parentNode) {

            if (!element.activeStyle.flags.staticPositioning)
                break;

            topMostInvalidation = element;
            invalidatedElements.add(element);

        }

        // Third step, we`re preparing a rendering of the top-most invalidated element
        // (If the element shrinks, then having prepared a redraw allow us to easily remove the extraneous space)

        if (this.screenNode)
            this.screenNode.prepareRedrawRect(topMostInvalidation.clipElementBox.get());

        // Fourth step, we now execute every action that could invalidate the box of our elements

        let ret = invalidatingActionsCallback();

        // Fifth step, each invalidated element also has to invalidate its children using relative sizes - recursively
        // Wanna know why we`re doing it here rather than in fourth step? It`s because the "invalidating actions" may have be to add (or remove) a child!

        let invalidateChildren = function (currentInvalidationPass) {

            let invalidatedChildren = new Set();

            for (let element of currentInvalidationPass) {
                for (let child of element.childNodes) {
                    invalidatedElements.add(child);
                    invalidatedChildren.add(child);
                }
            }

            return invalidatedChildren;

        };

        for (let currentPass = invalidatedElements; currentPass.size > 0;)
            currentPass = invalidateChildren(currentPass);

        // Sixth step, we can now actually invalidate the elements

        for (let element of invalidatedElements)
            element.elementBox.invalidate();

        // Seventh step, we`re preparing a rendering of the top-most invalidated element (we`re doing it another time on top of the one we scheduled in the third step, because our element might have grown)
        // Don`t forget to invalidate the render list: if the element shrinks, then previously hidden elements may be revealed

        if (this.screenNode) {
            this.screenNode.invalidateRenderList();
            this.screenNode.prepareRedrawRect(topMostInvalidation.clipElementBox.get());
        }

        return ret;

    }

    /**
     */

    prepareRedraw(contentRect = this.contentBox.get()) {

        if (!this.screenNode)
            return;

        if (!isNull(contentRect)) {

            this.contentBox.setStub(contentRect);
            let clipRect = this.clipContentBox.get();
            this.contentBox.setStub(null);

            this.screenNode.prepareRedrawRect(clipRect);

        } else {

            this.screenNode.prepareRedrawRect(null);

        }

    }

    /**
     */

    renderElement(x, y, l) {

        throw new Error(`renderElement is not implemented`);

    }

    /**
     */

    renderContent(x, y, l) {

        throw new Error(`renderContent is not implemented`);

    }

    /**
     */

    refreshActiveStyles() {

        let style = extend(true, {}, this.style);

        if (this.screenNode && this.screenNode.activeElement === this)
            extend(true, style, style.active);

        if (style.position === `static` || style.position === `relative`)
            style.left = style.right = style.top = style.bottom = null;

        if (style.left != null && style.right != null)
            style.width = style.minWidth = style.maxWidth = null;

        if (style.top != null && style.bottom != null)
            style.height = style.minHeight = style.maxHeight = null;

        if (style.width === `auto`)
            style.width = `100%`;

        if (style.height === `auto`)
            style.height = `adaptive`;

        extend(true, style, { flags: {
            isVisible: style.display !== `none`,
            staticPositioning: style.position === `static` || style.position === `relative`,
            absolutePositioning: style.position === `absolute` || style.position === `fixed`,
            parentRelativeWidth: (style.left != null && style.right != null) || [ style.left, style.right, style.width, style.minWidth, style.maxWidth ].some(value => percentageRegexF.test(value)),
            parentRelativeHeight: (style.top != null && style.bottom != null) || [ style.top, style.bottom, style.height, style.minHeight, style.maxHeight ].some(value => percentageRegexF.test(value)),
            hasAdaptiveWidth: style.width === `adaptive`,
            hasAdaptiveHeight: style.height === `adaptive`
        } });

        this._switchActiveStyle(style);

    }

    /**
     * Change the style of the element. If required, reset some internal properties in order to compute them again later.
     *
     * - left/right/width require an update of the element boxes X axis
     * - top/bottom/height require an update of the element boxes Y axis
     * - border require an update of all the element boxes
     * - zIndex changes require to refresh the screen render list (in order to sort it again)
     */

    _switchActiveStyle(newActiveStyle) {

        let changed = property => newActiveStyle[property] !== this.activeStyle[property];

        let dirtyContentBox = [ `border`, `ch`, `textAlign` ].some(changed);
        let dirtyElementBoxesX = [ `position`, `left`, `right`, `width`, `minWidth`, `maxWidth` ].some(changed);
        let dirtyElementBoxesY = [ `position`, `top`, `bottom`, `height`, `minHeight`, `maxHeight` ].some(changed);
        let dirtyRenderList = [ `display`, `zIndex` ].some(changed);

        let actions = () => { this.activeStyle = newActiveStyle; };
        this.applyElementBoxInvalidatingActions(true, true, actions);

        if (this.screenNode && dirtyRenderList) {
            this.screenNode.invalidateRenderList();
        }

    }

    _cascadeScreenNode() {

        for (let child of this.childNodes) {
            child.screenNode = this.screenNode;
            child._cascadeScreenNode();
        }

    }

}
