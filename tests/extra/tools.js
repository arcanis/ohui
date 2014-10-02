var Stream = require( 'stream' );

var OhUI = require( '../..' );

var createDummyInputStream = exports.createDummyInputStream = function ( ) {
    var stream = new Stream( );
    stream.setRawMode = function ( ) { };
    return stream;
};

var createDummyOutputStream = exports.createDummyOutputStream = function ( ) {
    var stream = new Stream( );
    stream.write = function ( ) { };
    stream.columns = 100;
    stream.rows = 100;
    return stream;
};

var createScreen = exports.createScreen = function ( ) {
    return new OhUI.Screen( {
        stdin : createDummyInputStream( ),
        stdout : createDummyOutputStream( )
    } );
};

var createTree = exports.createTree = function ( set, description ) {

    description = description.slice( );

    var name = description.shift( );
    var type = [ 'string', 'function' ].indexOf( typeof description[ 0 ] ) !== -1 ? description.shift( ) : 'Element';
    var args = typeof description[ 0 ] === 'object' && ! Array.isArray( description[ 0 ] ) ? description.shift( ) : { };
    var children = Array.isArray( description[ 0 ] ) ? description.shift( ) : [ ];

    if ( description.length )
        throw new Error( 'Invalid tree' );

    if ( typeof type === 'string' ) {
        type = function ( type, what ) {
            return new ( OhUI[ type ] )( what );
        }.bind( null, type );
    }

    var element = set[ name ] = type( args );

    children.forEach( function ( childDescription ) {
        createTree( set, childDescription );
        element.appendChild( set[ childDescription[ 0 ] ] );
    } );

    return set;

};
