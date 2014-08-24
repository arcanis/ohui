import { Box } from '../boxes/Box';

var numberRegexp = '([+-]?(?:[0-9]+\\.[0-9]*|[0-9]*\\.[0-9]+|[0-9]+))';
var minMaxRegexp = '(?:\\{' + numberRegexp + '?,' + numberRegexp +'?\\})';

var numberFormatRegexp = new RegExp( '^' + numberRegexp + '$' );
var percentFormatRegexp = new RegExp( '^' + numberRegexp + '%(?: ' + minMaxRegexp + ')?$' );

function computeRelativeValue( value, relativeTo ) {

    if ( value == null )
        return null;

    if ( ! isNaN( Number( value ) ) )
        return Number( value );

    var strValue = value + '', match;

    if ( ( match = value.match( percentFormatRegexp ) ) ) {

        value = Math.floor( relativeTo * Number( match[ 1 ] ) / 100 );

        if ( match[ 2 ] ) value = Math.max( value, Number( match[ 2 ] ) );
        if ( match[ 3 ] ) value = Math.min( value, Number( match[ 3 ] ) );

        return value;

    } else {

        return undefined;

    }

}

export class ElementBox extends Box {

    refreshX( ) {

        var parentWidth = this._element.parentNode._contentBox.get( true, false ).width;
        var activeStyle = this._element.activeStyle;

        var left = computeRelativeValue( activeStyle.left, parentWidth );
        var right = computeRelativeValue( activeStyle.right, parentWidth );
        var width = computeRelativeValue( activeStyle.width, parentWidth );

        if ( left != null && right != null ) {

            this._rect.left = left;
            this._rect.right = right;

            this._rect.width = Math.max( 0, parentWidth - this._rect.left - this._rect.right );

        } else if ( left != null ) {

            this._rect.left = left;
            this._rect.width = width;

            this._rect.right = parentWidth - this._rect.left - this._rect.width;

        } else if ( right != null ) {

            this._rect.right = right;
            this._rect.width = width;

            this._rect.left = parentWidth - this._rect.right - this._rect.width;

        } else if ( width != null ) {

            this._rect.left = 0;
            this._rect.width = width;

            this._rect.right = Math.max( 0, parentWidth - this._rect.width );

        } else {

            this._rect.left = 0;
            this._rect.right = 0;

            this._rect.width = parentWidth;

        }

    }

    refreshY( ) {

        var parentHeight = this._getParentHeight( );
        var activeStyle = this._element.activeStyle;

        var scrollTop = this._element.parentNode.scrollTop;

        var top = computeRelativeValue( activeStyle.top, parentHeight );
        var bottom = computeRelativeValue( activeStyle.bottom, parentHeight );
        var height = computeRelativeValue( activeStyle.height, parentHeight );

        if ( height == null && ( top == null || bottom == null ) )
            height = this._element.scrollHeight + ( activeStyle.border ? 2 : 0 );

        if ( top != null && bottom != null ) {

            this._rect.top = top;
            this._rect.bottom = bottom;

            this._rect.height = Math.max( 0, parentHeight - this._rect.top - this._rect.bottom );

        } else if ( top != null ) {

            this._rect.top = top;
            this._rect.height = height;

            this._rect.bottom = parentHeight - this._rect.top - this._rect.height;

        } else if ( bottom != null ) {

            this._rect.bottom = bottom;
            this._rect.height = height;

            this._rect.top = parentHeight - this._rect.bottom - this._rect.height;

        } else {

            this._rect.top = 0;
            this._rect.height = height;

            this._rect.bottom = Math.max( 0, parentHeight - this._rect.height );

            for ( var element = this._element.previousSibling; element; element = element.previousSibling )
                if ( element.activeStyle.position === 'static' )
                    break ;

            if ( element ) {

                var previousBox = element._elementBox.get( false, true );
                var offsetTop = previousBox.top + previousBox.height;

                this._rect.top += offsetTop;
                this._rect.bottom -= offsetTop;

            }

        }

    }

    _getParentHeight( ) {

        var parent = this._element.parentNode;

        for ( ; parent; parent = parent.parentNode )
            if ( parent.activeStyle.height != null || ( parent.activeStyle.top != null && parent.activeStyle.bottom != null ) )
                return parent._contentBox.get( false, true ).height;

        return NaN;

    }

}
