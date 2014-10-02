import { applyTerminalColor, resetTerminalStyles } from './utilities/Color';
import { Element }                                 from './Element';

export class Text extends Element {

    constructor( style ) {

        super( style );

        this._segmentSize = 0;
        this._originalContent = '';
        this._parsedContent = [ ];

        Object.defineProperty( this, 'innerText', {
            set : this.setContent.bind( this )
        } );

        Object.defineProperty( this, 'scrollHeight', {
            get : ( ) => this._getParsedContent( ).length
        } );

    }

    setContent( content ) {

        return this.applyElementBoxInvalidatingActions( true, true, ( ) => {

            this._originalContent = content;
            this._parsedContent = null;

        } );

    }

    renderLine( x, y, l ) {

        var line = this._getParsedContent( )[ y ] || '';

        if ( this.activeStyle.textAlign === 'center' ) {

            var pad = Math.floor( ( this._segmentSize - line.length ) / 2 );
            var prefix = new Array( pad + 1 ).join( this.activeStyle.ch || ' ' );

            return prefix + line.substr( x, l - pad );

        } else {

            return line.substr( x, l );

        }

    }

    _getParsedContent( ) {

        if ( this._parsedContent )
            return this._parsedContent;

        var parsedContent = this._parsedContent = [ ];
        var segmentSize = this._segmentSize = this.contentBox.get( true, false ).width || Infinity;

        var lines = this._originalContent.replace( /\t/g, '    ' ).split( /(?:\r\n|\r|\n)/g );

        lines.forEach( line => {

            var segmentCount = Math.ceil( line.length / segmentSize );

            for ( var t = 0; t < segmentCount; ++ t ) {
                var segment = line.substr( t * segmentSize, segmentSize );
                parsedContent.push( segment );
            }

        } );

        return parsedContent;

    }

}
