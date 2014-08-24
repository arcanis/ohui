export var ansiColors = [ 'BLACK', 'RED', 'GREEN', 'YELLOW', 'BLUE', 'MAGENTA', 'CYAN', 'WHITE' ].reduce( ( colors, name, index ) => {
    colors[ name ] = index;
    return colors;
}, { } );
