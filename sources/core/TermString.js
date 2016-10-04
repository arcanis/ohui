import { isArray, isNil, isRegExp, isUndefined } from 'lodash';

export class TermString {

    constructor(string) {

        this._content = [ '' ];

        this.length = 0;

        if (!isUndefined(string)) {
            this.push(string);
        }

    }

    push(string, raw = false) {

        if (isNil(string))
            return this;

        if (string instanceof TermString) {

            this.length += string.length;

            if (this._content.length % 2 === 1) {

                this._content[this._content.length - 1] += string._content[0];
                this._content = this._content.concat(string._content.slice(1));

            } else {

                this._content = this._content.concat(string._content);

            }

        } else if (raw) {

            let asString = String(string);

            if (asString.length === 0)
                return this;

            if (this._content.length % 2 === 0) {

                this._content[this._content.length - 1] += asString;

            } else {

                this._content.push(asString);

            }

        } else {

            let asString = String(string);

            if (asString.length === 0)
                return this;

            if (this._content.length % 2 === 1) {

                this._content[this._content.length - 1] += asString;
                this.length += asString.length;

            } else {

                this._content.push(asString);
                this.length += asString.length;

            }

        }

        return this;

    }

    unshift(string, raw = false) {

        if (isNil(string))
            return this;

        if (string instanceof TermString) {

            this._content.length += string.length;

            if (string._content.length % 2 === 1) {

                this._content[0] = string._content[string._content.length - 1] + this._content[0];
                this._content = [].concat(string._content.slice(0, string._content.length - 1), this._content);

            } else {

                this._content = [].concat(string._content, this._content);

            }

        } else if (raw) {

            let asString = String(raw);

            if (asString.length === 0)
                return this;

            this._content.unshift(string);
            this._content.unshift('');

        } else {

            let asString = String(raw);

            if (asString.length === 0)
                return this;

            this._content[0] = string + this._content[0];
            this.length += asString.length;

        }

        return this;

    }

    substr(offset, length = this.length - offset) {

        if (offset + length > this.length)
            length = Math.max(0, this.length - offset);

        let index = 0;

        while (index + 2 < this._content.length && offset >= this._content[index].length) {
            offset -= this._content[index].length;
            index += 2;
        }

        let prefix = ``;

        for (let escapeCodeIndex = index - 1; escapeCodeIndex >= 0; escapeCodeIndex -= 2)
            prefix = this._content[escapeCodeIndex] + prefix;

        let result = new TermString();
        result.push(prefix, true);

        while (index < this._content.length && length > 0) {

            result.push(this._content[index - 1], true);
            result.push(this._content[index].substr(offset, length));

            length -= this._content[index].length - offset;
            offset = 0;
            index += 2;

        }

        return result;

    }

    split(pattern) {

        let last = new TermString(), results = [ last ];

        let prefix = '';
        let match, offset, str;

        if (!isRegExp(pattern))
            throw new Error('TermString can only split on regexp');

        let regex = pattern.global ? pattern : new RegExp(pattern.source, 'g' + [
            pattern.multiline ? 'm' : '',
            pattern.ignoreCase ? 'i' : ''
        ].join(''));

        for (let t = 0; t < this._content.length; t += 2) {

            let escapeCode = this._content[t - 1] || '';

            last.push(escapeCode, true);
            prefix += escapeCode;

            str = this._content[t];
            offset = 0;

            while ((match = regex.exec(str))) {

                last.push(str.substr(offset, match.index - offset));
                offset = match.index + match[0].length;

                results.push(last = new TermString());
                last.push(prefix, true);

            }

            last.push(this._content[t].substr(offset));

        }

        return results;

    }

    replace(pattern, replacement, insideRaw = false) {

        let other = new TermString(this);

        for (let t = insideRaw ? 1 : 0; t < other._content.length; t += 2) {

            let part = other._content[t];
            let replaced = part.replace(pattern, replacement);

            if (part === replaced)
                continue ;

            if (!insideRaw) {
                other.length -= part.length;
                other.length += replaced.length;
            }

            if (!pattern.global) {
                break ;
            }

        }

        return other;

    }

    padEnd(expectedLength, character = ` `) {

        let other = new TermString(this);

        if (other.length < expectedLength)
            other.push(character.repeat(expectedLength - other.length));

        return other;

    }

    toString() {

        return this._content.join('');

    }

}
