import { applyTerminalColor, resetTerminalStyles } from './utilities/Color';
import { Element }                                 from './Element';

export class Text extends Element {

    constructor( style ) {

        super( style );

        this._originalContent = '';
        this._parsedContent = [ ];

        Object.defineProperty( this, 'scrollHeight', {
            get : ( ) => this._getParsedContent( ).length
        } );

        Object.defineProperty( this, 'innerText', {
            set : this.setContent.bind( this )
        } );

    }

    invalidateRects( ... args ) {

        super( ... args );

        this._parsedContent = null;

        return this;

    }

    setContent( content ) {

        this._originalContent = content;
        this._parsedContent = null;

        this._prepareRedrawSelf( );

        return this;

    }

    _getParsedContent( ) {

        if ( this._parsedContent )
            return this._parsedContent;

        var parsedContent = [ ];
        var lineRegexp = new RegExp( '.{1,' + this._contentBox.get( true, false ).width + '}', 'g' );

        this._originalContent.split( /(?:\r\n|\r|\n)/g ).forEach( line => {
            var sublines = line.match( lineRegexp ) || [ '' ];
            parsedContent = parsedContent.concat( sublines );
        } );

        return parsedContent;

    }

    _renderLine( x, y, l ) {

        var line = ( this._getParsedContent( )[ y ] || '' ).substr( x, l );

        for ( var t = line.length; t < l; ++ t )
            line += this.activeStyle.ch || ' ';

        if ( this.activeStyle.color ) {
            var color = applyTerminalColor( this.activeStyle.color.fg, this.activeStyle.color.bg );
            var reset = resetTerminalStyles( );
            line = color + line + reset;
        }

        return line;

    }

}
