import   extend       from 'extend';

import { Event }      from '../core';
import { ansiColors } from '../core';

import { Text }       from './Text';

export class Input extends Text {

    constructor(style, { monoline } = { }) {

        super(extend(true, {

            minHeight: 1,

            focusable: true,
            ch: `.`,

            active: {
                color: {
                    bg: ansiColors.BLUE
                }
            }

        }, style));

        this._caretOffset = 0;
        this._innerValue = ``;

        this.declareEvent(`input`);

        Object.defineProperty(this, `value`, {

            get: () => {

                return this._innerValue;

            },

            set: (newValue) => {

                if (monoline)
                    newValue = newValue.replace(/(\r\n|\r|\n)/g, ``);

                this._innerValue = newValue;
                this._caretOffset = this._innerValue.length;

                this.innerText = this._innerValue;

            }

        });

        this.addEventListener(`data`, e => {

            if (!e.data)
                return ;

            e.setDefault(() => {

                var data = e.data;

                if (monoline)
                    data = data.replace(/(\r\n|\r|\n)/g, ``);

                if (data.length === 0)
                    return ;

                if (this._caretOffset !== this._innerValue.length) {
                    this._innerValue = this._innerValue.substr(0, this._caretOffset) + data + this._innerValue.substr(this._caretOffset);
                } else {
                    this._innerValue += data;
                }

                this._caretOffset += data.length;
                this.innerText = this._innerValue;

                var event = new Event(`input`, { target: this });
                this.dispatchEvent(event);

            });

        });

        this.addShortcutListener(`backspace`, e => {

            e.setDefault(() => {

                e.preventDefault();

                if (this._caretOffset === 0)
                    return ;

                if (this._caretOffset !== this._innerValue.length) {
                    this._innerValue = this._innerValue.substr(0, this._caretOffset - 1) + this._innerValue.substr(this._caretOffset);
                } else {
                    this._innerValue = this._innerValue.substr(0, this._caretOffset - 1);
                }

                this._caretOffset -= 1;
                this.innerText = this._innerValue;

                var event = new Event(`input`, { target: this });
                this.dispatchEvent(event);

            });

        });

    }

};
