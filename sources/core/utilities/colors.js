import { isNil } from 'lodash';
import tput      from 'node-tput';

export function applyTerminalColor(fg, bg) {

    var result = ``;

    if (!isNil(fg))
        result += tput(`setaf`, fg);

    if (!isNil(bg))
        result += tput(`setab`, bg);

    return result;

}

export function resetTerminalStyles() {

    return tput(`sgr0`);

}
