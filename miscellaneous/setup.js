var System = require( 'systemjs' );

process.stdlog = require( 'fs' ).createWriteStream( 'log', { 'flags' : 'a' } );

console.clear = function ( ) {

    process.stdlog.write( "\u001b[2J" );
    process.stdlog.write( "\u001b[0;0H" );

};

console.log = function ( ) {

    var argv = Array.prototype.slice.call( arguments );

    argv = argv.map( function ( o ) {
        return o instanceof Array ?
            require( 'util' ).inspect( o, false, 1 ) :
            typeof o === 'object' ?
                require( 'util' ).inspect( o, false, 0 ) :
                 o; } );

    process.stdlog.write( argv.join( ' ' ) + '\n' );

};

console.clear( );

System.paths[ 'ohui/*' ] = '../sources/*.js';

System.register( 'extend', [ ], function ( $__export ) {
    $__export( 'default', require( 'extend' ) );
    return { setters : [ ], execute : function ( ) { } };
} );

System.register( 'stable', [ ], function ( $__export ) {
    $__export( 'default', require( 'stable' ) );
    return { setters : [ ], execute : function ( ) { } };
} );

System.register( 'node-tput', [ ], function ( $__export ) {
    $__export( 'default', require( 'node-tput' ) );
    return { setters : [ ], execute : function ( ) { } };
} );

System.register( 'keypress', [ ], function ( $__export ) {
    $__export( 'default', require( 'keypress' ) );
    return { setters : [ ], execute : function ( ) { } };
} );

System.import( 'test' ).then( function ( m ) {
    return m.main( );
} ).catch( function ( err ) {
    setTimeout( function ( ) {
        throw err;
    } );
} );
