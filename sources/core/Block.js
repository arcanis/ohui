import { applyTerminalColor, resetTerminalStyles } from './utilities/colors';

import { Element }                                 from './Element';

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

    renderLine(x, y, l) {

        let contentStart = x;
        let contentLength = l;
        let content;

        let rect = this.elementBox.get();
        let activeStyle = this.activeStyle;

        // Remove the left & right borders from the line content offsets

        if (activeStyle.border) {

            contentStart -= 1;

            if (x === 0)
                contentLength -= 1;

            if (x + l === rect.width)
                contentLength -= 1;

            contentStart = Math.max(0, contentStart);
            contentLength = Math.max(0, contentLength);

        }

        // Get the line content for the correct type of line among the three possible cases:
        // - A top/bottom line of a bordered box
        // - A middle line of a bordered box, or any line of a non-bordered box

        if (activeStyle.border && (y === 0 || y === rect.height - 1)) {

            content = new Array(contentLength + 1).join(activeStyle.border.horizontal);

        } else {

            content = new Array(contentLength + 1).join(activeStyle.ch || ` `);

            if (activeStyle.color) {
                let color = applyTerminalColor(activeStyle.color.fg, activeStyle.color.bg);
                let reset = resetTerminalStyles();
                content = color + content + reset;
            }

        }

        // If we're in a bordered box, we add the right prefix and suffix according to the top/middle/bottom line
        // Note that we add them only if required; ie. that for example we don't draw the prefix if we print a box from 1 cell inside

        if (activeStyle.border) {

            let prefix = ``, suffix = ``;

            // Should we print the prefix?
            if (x === 0) {
                if (y === 0) {
                    prefix = activeStyle.border.topLeft;
                } else if (y === rect.height - 1) {
                    prefix = activeStyle.border.bottomLeft;
                } else {
                    prefix = activeStyle.border.vertical;
                }
            }

            // Should we print the suffix?
            if (x + l === rect.width) {
                if (y === 0) {
                    suffix = activeStyle.border.topRight;
                } else if (y === rect.height - 1) {
                    suffix = activeStyle.border.bottomRight;
                } else {
                    suffix = activeStyle.border.vertical;
                }
            }

            // Should the border prefix/suffix be colored?
            if (activeStyle.border.fg || activeStyle.border.bg) {

                let color = applyTerminalColor(activeStyle.border.fg, activeStyle.border.bg);

                prefix = color + prefix;

                // Don't forget to reset the color after the prefix for middle lines
                // And to add it back when drawing the suffix
                if (y !== 0 && y !== rect.height - 1) {
                    content = resetTerminalStyles() + content;
                    suffix = color + suffix;
                }

                suffix = suffix + resetTerminalStyles();

            }

            content = prefix + content + suffix;

        }

        return content;

    }

}
