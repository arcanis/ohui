import tput from 'node-tput';

export function applyTerminalColor( fg, bg ) {

    var result = '';

    if ( fg != null )
        result += tput( 'setaf', fg );

    if ( bg != null )
        result += tput( 'setab', bg );

    return result;

}

export function resetTerminalStyles( ) {

    return tput( 'sgr0' );

}
