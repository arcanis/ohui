import extend from 'extend';

export let borders = {

    simple: style => extend( true, {

        topLeft     : '┌',
        topRight    : '┐',
        bottomLeft  : '└',
        bottomRight : '┘',
        vertical    : '│',
        horizontal  : '─'

    }, style ),

    strong: style => extend( true, {

        topLeft     : '╔',
        topRight    : '╗',
        bottomLeft  : '╚',
        bottomRight : '╝',
        vertical    : '║',
        horizontal  : '═'

    }, style )

};
