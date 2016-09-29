import { Box }                            from '../boxes/Box';
import { numberRegexF, percentageRegexF } from '../constants';

export class ElementBox extends Box {

    refreshSize( axis ) {

        switch ( this._element.activeStyle.position ) {

            case 'static' :
            case 'relative' :
                this._refreshSizeStatic( axis );
            break ;

            case 'absolute' :
            case 'fixed' :
                this._refreshSizeAbsolute( axis );
            break ;

        }

        var min = this._resolveValue( axis, this._element.activeStyle[ axis.minSize ] );
        var max = this._resolveValue( axis, this._element.activeStyle[ axis.maxSize ] );

        if ( max != null && max < this._rect[ axis.size ] )
            this._rect[ axis.size ] = max;

        if ( min != null && min > this._rect[ axis.size ] ) {
            this._rect[ axis.size ] = min;
        }

    }

    refreshPosition( axis ) {

        switch ( this._element.activeStyle.position ) {

            case 'static' :
            case 'relative' :
                this._refreshPositionStatic( axis );
            break ;

            case 'absolute' :
            case 'fixed' :
                this._refreshPositionAbsolute( axis );
            break ;

        }

    }

    _refreshSizeStatic( axis ) {

        var size = this._resolveValue( axis, this._element.activeStyle[ axis.size ] );

        this._rect[ axis.size ] = size;

    }

    _refreshPositionStatic( axis ) {

        this._rect[ axis.a ] = 0;
        this._rect[ axis.b ] = this._getBaseSize( axis ) - this._rect[ axis.size ];

        if ( axis.a === 'top' ) {

            var previous = this._element.previousSibling;

            while ( previous && ! previous.activeStyle.flags.staticPositioning )
                previous = previous.previousNode;

            if ( previous ) {

                var previousBoxRect = previous.elementBox.getY( );
                var top = previousBoxRect.top + previousBoxRect.height;

                this._rect[ axis.a ] += top;
                this._rect[ axis.b ] -= top;

            }

        }

    }

    _refreshSizeAbsolute( axis ) {

        var size = this._resolveValue( axis, this._element.activeStyle[ axis.size ] );

        if ( size != null ) {

            this._rect[ axis.size ] = size;

        } else {

            var base = this._getBaseSize( axis );

            var a = this._resolveValue( axis, this._element.activeStyle[ axis.a ] );
            var b = this._resolveValue( axis, this._element.activeStyle[ axis.b ] );

            this._rect[ axis.size ] = base - a - b;

        }

    }

    _refreshPositionAbsolute( axis ) {

        var base = this._getBaseSize( axis );
        var size = this._rect[ axis.size ];

        var a = this._resolveValue( axis, this._element.activeStyle[ axis.a ] );
        var b = this._resolveValue( axis, this._element.activeStyle[ axis.b ] );

        if ( a != null ) {
            b = base - size - a;
        } else if ( b != null ) {
            a = base - size - b;
        } else {
            a = 0;
            b = base - size;
        }

        this._rect[ axis.a ] = a;
        this._rect[ axis.b ] = b;

    }

    _resolveValue( axis, value ) {

        if ( value == null )
            return value;

        if ( typeof value === 'number' )
            return Math.floor( value );

        if ( typeof value !== 'string' )
            throw new Error( 'Invalid value type' );

        if ( value === 'adaptive' )
            return this._getAdaptiveSize( axis );

        if ( numberRegexF.test( value ) )
            return Math.floor( value.match( numberRegexF )[ 1 ] );

        if ( percentageRegexF.test( value ) )
            return Math.floor( value.match( percentageRegexF )[ 1 ] * this._getBaseSize( axis ) / 100 );

        throw new Error( 'Invalid value format (is "' + value + '")' );

    }

    _getAdaptiveSize( axis ) {

        return this._element[ axis.scrollSize ];

    }

    _getBaseSize( axis ) {

        var baseElement = this._element.parentNode;

        while ( baseElement && baseElement.activeStyle.flags[ axis.adaptiveFlag ] )
            baseElement = baseElement.parentNode;

        if ( ! baseElement )
            return 0;

        switch ( axis.size ) {

            case 'width' :
                return baseElement.contentBox.getWidth( );
            break ;

            case 'height' :
                return baseElement.contentBox.getHeight( );
            break ;

        }

    }

}
