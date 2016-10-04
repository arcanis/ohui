import { style }      from '@manaflair/term-strings';

import { Element }    from './Element';
import { TermString } from './TermString';

export class Block extends Element {

    constructor(style) {

        super(style);

        this.addShortcutListener(`home`, e => {

            e.setDefault(() => {

                this.scrollTo(0);

            });

        });

        this.addShortcutListener(`end`, e => {

            e.setDefault(() => {

                this.scrollTo(Infinity);

            });

        });

        this.addShortcutListener(`up`, e => {

            e.setDefault(() => {

                this.scrollBy(-1);

            });

        });

        this.addShortcutListener(`down`, e => {

            e.setDefault(() => {

                this.scrollBy(+1);

            });

        });

        this.addShortcutListener(`pageup`, e => {

            e.setDefault(() => {

                this.scrollBy(-10);

            });

        });

        this.addShortcutListener(`pagedown`, e => {

            e.setDefault(() => {

                this.scrollBy(+10);

            });

        });

    }

    scrollTo(offset) {

        offset = Math.min(offset, this.scrollHeight - this.contentBox.get().height);
        offset = Math.max(0, offset);

        if (offset === this.scrollTop)
            return this;

        return this.applyElementBoxInvalidatingActions(false, true, () => {

            this.scrollTop = offset;

            this.screenNode.invalidateRenderList();

        });

    }

    scrollBy(relative) {

        this.scrollTo(this.scrollTop + relative);

        return this;

    }

    scrollLineIntoView(line, anchor) {

        let scrollTop = this.scrollTop;
        let height = this.contentBox.getY().height;

        if (line >= scrollTop && line < scrollTop + height)
            return this;

        if (isUndefined(anchor)) {
            if (line <= scrollTop) {
                anchor = `top`;
            } else {
                anchor = `bottom`;
            }
        }

        switch (anchor) {

            case `top`:
                this.scrollTo(line);
            break ;

            case `bottom`:
                this.scrollTo(line + 1 - height);
            break ;

            default:
            throw new Error(`Invalid scroll anchor`);

        }

        return this;

    }

    renderElement(x, y, l) {

        let elementRect = this.elementBox.get();
        let activeStyle = this.activeStyle;

        let processBorders = (x, y, l) => {

            if (!activeStyle.border)
                return processContent(x, y, l);

            let prepend = ``;
            let append = ``;

            if (y === 0) {

                let contentL = l;

                if (x === 0) {
                    prepend = activeStyle.border.topLeft;
                    contentL -= 1;
                }

                if (x + l === elementRect.width) {
                    append = activeStyle.border.topRight;
                    contentL -= 1;
                }

                let data = prepend + activeStyle.border.horizontal.repeat(contentL) + append;

                if (activeStyle.backgroundColor)
                    data = style.back(activeStyle.backgroundColor) + data;

                if (activeStyle.borderColor)
                    data = style.front(activeStyle.borderColor) + data;

                if (activeStyle.backgroundColor || activeStyle.borderColor)
                    data += style.clear;

                return data;

            } else if (y === elementRect.height - 1) {

                let contentL = l;

                if (x === 0) {
                    prepend = activeStyle.border.bottomLeft;
                    contentL -= 1;
                }

                if (x + l === elementRect.width) {
                    append = activeStyle.border.bottomRight;
                    contentL -= 1;
                }

                let data = prepend + activeStyle.border.horizontal.repeat(contentL) + append;

                if (activeStyle.backgroundColor)
                    data = style.back(activeStyle.backgroundColor) + data;

                if (activeStyle.borderColor)
                    data = style.front(activeStyle.borderColor) + data;

                if (activeStyle.backgroundColor || activeStyle.borderColor)
                    data += style.clear;

                return data;

            } else {

                let contentX = x;
                let contentY = y - 1;
                let contentL = l;

                if (x === 0) {
                    prepend = activeStyle.border.vertical;
                    contentL -= 1;
                } else {
                    contentX -= 1;
                }

                if (x + l === elementRect.width) {
                    append = activeStyle.border.vertical;
                    contentL -= 1;
                }

                if (activeStyle.backgroundColor) {

                    if (prepend)
                        prepend = style.back(activeStyle.backgroundColor) + prepend;

                    if (append) {
                        append = style.back(activeStyle.backgroundColor) + append;
                    }

                }

                if (activeStyle.borderColor) {

                    if (prepend)
                        prepend = style.front(activeStyle.borderColor) + prepend;

                    if (append) {
                        append = style.front(activeStyle.borderColor) + append;
                    }

                }

                if (activeStyle.backgroundColor || activeStyle.borderColor) {

                    if (prepend)
                        prepend += style.clear;

                    if (append) {
                        append += style.clear;
                    }

                }

                return prepend + processContent(contentX, contentY, contentL) + append;

            }

        };

        let processContent = (x, y, l) => {

            let content = this.renderContent(x, y, l);

            if (content.length < l) {

                if (activeStyle.backgroundColor || activeStyle.borderColor)
                    content = new TermString(content);

                if (activeStyle.backgroundColor)
                    content = content.push(style.back(activeStyle.backgroundColor), true);

                if (activeStyle.color)
                    content = content.push(style.front(activeStyle.color), true);

                content = content.padEnd(l, activeStyle.backgroundCharacter);

                if (activeStyle.backgroundColor || activeStyle.borderColor) {
                    content = content.push(style.clear);
                }

            }

            return content;

        };

        return processBorders(x, y, l);

    }

    renderContent(x, y, l) {

        return ``;

    }

}
