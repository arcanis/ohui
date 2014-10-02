import { TermString }     from 'ohui/utilities/TermString';
import { simple, strong } from 'ohui/borders';
import { Screen }         from 'ohui/Screen';
import { Block }          from 'ohui/Block';
import { Text }           from 'ohui/Text';
import { Input }          from 'ohui/Input';

var format = function ( box ) {

    var rect = box.get( );

    return `left: ${rect.left}, right: ${rect.right}, width: ${rect.width}, top: ${rect.top}, bottom: ${rect.bottom}, height: ${rect.height}`;

};

var debug = function ( label, element ) {

    console.log( `${label}: element box         `, format( element.elementBox ) );
    console.log( `${label}: content box         `, format( element.contentBox ) );
    console.log( `${label}: scroll element box  `, format( element.scrollElementBox ) );
    console.log( `${label}: scroll content box  `, format( element.scrollContentBox ) );
    console.log( `${label}: world element box   `, format( element.worldElementBox ) );
    console.log( `${label}: world content box   `, format( element.worldContentBox ) );
    console.log( `${label}: clip element box    `, format( element.clipElementBox ) );
    console.log( `${label}: clip content box    `, format( element.clipContentBox ) );

};

export function main( ) {

    var screen = new Screen( );

    var block = new Block( { border : strong( ), position : 'absolute', left : 2, right : 2, top : 1, bottom : 1 } );
    screen.appendChild( block );

    var test = new Block( { border : simple( ), position : 'absolute', left : 1, right : 1, top : 0, bottom : 0, focusable : true } );
    block.appendChild( test );

    var waza = new Block( { border : simple( ), position : 'fixed', right : 0, top : 0, width : 20, height : 6, zIndex : 2, ch : '@' } );
    test.appendChild( waza );

    var wazaString = new TermString( );
    wazaString.push( 'This text is ' );
    wazaString.push( [ 'setaf', 1 ] );
    wazaString.push( 'red' );
    wazaString.push( [ 'sgr0' ] );
    wazaString.push( '.' );

    var wazaText = new Text( );
    waza.appendChild( wazaText );
    wazaText.innerText = wazaString;

    var foobar = new Block( { border : strong( ), position : 'absolute', left : 10, top : 10, width : 5, height : 5, zIndex : 1, ch : '*' } );
    test.appendChild( foobar );

    for ( var t = 0; t < 100; ++ t ) {

        var temp = new Block( { border : simple( ) } );
        test.appendChild( temp );

        var text = new Text( );
        temp.appendChild( text );
        text.innerText = '#' + t;

        var input = new Input( );
        temp.appendChild( input );

    }

    screen.addShortcutListener( 'C-d', ( ) => {

        var i = 98;

        console.clear( );

        debug( 'test          ', test );
        console.log( );
        debug( 'temp ' + i + '       ', test.childNodes[ i ] );
        console.log( );
        debug( 'temp ' + i + ' text  ', test.childNodes[ i ].firstChild );
        console.log( );
        debug( 'temp ' + i + ' input ', test.childNodes[ i ].lastChild );
        console.log( );
        debug( 'temp ' + ( i + 1 ) + '       ', test.childNodes[ i + 1 ] );
        console.log( );

    } );

    screen.addShortcutListener( 'C-u', ( ) => {

        screen.getNodeList( ).forEach( element => { element.elementBox.invalidate( ); } );

        test._prepareRedrawSelf( );

    } );

}
