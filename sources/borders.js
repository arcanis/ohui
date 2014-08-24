import extend from 'extend';

export function simple( style ) { return extend( true, {

    topLeft     : '┌',
    topRight    : '┐',
    bottomLeft  : '└',
    bottomRight : '┘',
    vertical    : '│',
    horizontal  : '─'

}, style ); }

export function strong( style ) { return extend( true, {

    topLeft     : '╔',
    topRight    : '╗',
    bottomLeft  : '╚',
    bottomRight : '╝',
    vertical    : '║',
    horizontal  : '═'

}, style ); }
