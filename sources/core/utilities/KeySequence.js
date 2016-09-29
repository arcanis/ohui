class Key {

    static parse(string) {

        let key = new Key();

        for (let part of string.split(/[+-]/g)) {

            switch (part) {

                case `C`: {
                    key.control = true;
                } break;

                case `M`: {
                    key.meta = true;
                } break;

                case `S`: {
                    key.shift = true;
                } break;

                default: {
                    key.key = part;
                } break;

            }

        }

        return key;

    }

    constructor() {

        this.shift = false;
        this.control = false;
        this.meta = false;

        this.key = null;

    }

    match(event) {

        if (this.control !== event.control)
            return false;

        if (this.shift !== event.shift)
            return false;

        if (this.meta !== event.meta)
            return false;

        if (this.key !== event.key)
            return false;

        return true;

    }

};

export class KeySequence {

    constructor(sequence) {

        this._buffer = [];

        this._sequence = String(sequence).split(/\s+/g)
            .map(key => Key.parse(key));

    }

    match(event) {

        this._buffer.push(event);

        if (this._buffer.length > this._sequence.length)
            this._buffer.splice(0, this._buffer.length - this._sequence.length);

        if (this._buffer.length < this._sequence.length)
            return false;

        for (let t = 0, T = this._sequence.length; t < T; ++t)
            if (!this._sequence[t].match(this._buffer[t]))
                return false;

        return true;

    }

}
