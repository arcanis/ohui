import { Rect } from 'ohui/utilities/Rect';

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

export function computeBoxFullRect( box ) {

    if ( box._fullRect )
        return box._fullRect;

    if ( ! box.screenNode )
        return box._fullRect = new Rect( );

    var activeStyle = box.activeStyle;

    var rect = box._fullRect = new Rect( );
    var parentRect = box.parentNode.getContentRect( );

    var scrollTop = box.parentNode.scrollTop | 0;

    var left = computeRelativeValue( activeStyle.left, parentRect.width );
    var right = computeRelativeValue( activeStyle.right, parentRect.width );
    var width = computeRelativeValue( activeStyle.width, parentRect.width );

    if ( left != null && right != null ) {

        rect.left = left;
        rect.right = right;

        rect.width = Math.max( 0, parentRect.width - rect.left - rect.right );

    } else if ( left != null ) {

        rect.left = left;
        rect.width = width;

        rect.right = parentRect.width - rect.left - rect.width;

    } else if ( right != null ) {

        rect.right = right;
        rect.width = width;

        rect.left = parentRect.width - rect.right - rect.width;

    } else if ( rect.width ) {

        rect.left = 0;
        rect.width = width;

        rect.right = Math.max( 0, parentRect.width - rect.width );

    } else {

        rect.left = 0;
        rect.right = 0;

        rect.width = parentRect.width;

    }

    var top = computeRelativeValue( activeStyle.top, parentRect.height );
    var bottom = computeRelativeValue( activeStyle.bottom, parentRect.height );
    var height = computeRelativeValue( activeStyle.height, parentRect.height );

    rect.isFlexHeight = height == null && ( top == null || bottom == null );

    if ( rect.isFlexHeight ) {

        height = box.getScrollHeight( );

        if ( activeStyle.border ) {
            height += 2;
        }

    }

    if ( top != null && bottom != null ) {

        rect.top = top;
        rect.bottom = bottom;

        rect.height = Math.max( 0, parentRect.height - rect.top - rect.bottom );

    } else if ( top != null ) {

        rect.top = top;
        rect.height = height;

        rect.bottom = parentRect.height - rect.top - rect.height;

    } else if ( bottom != null ) {

        rect.bottom = bottom;
        rect.height = height;

        rect.top = parentRect.height - rect.bottom - rect.height;

    } else {

        rect.top = 0;
        rect.height = height;

        rect.bottom = Math.max( 0, parentRect.height - rect.height );

        for ( var element = box.previousSibling; element; element = element.previousSibling ) {
            if ( element.activeStyle.top == null && element.activeStyle.bottom == null ){

                var subHeight = element.getFullRect( ).height;

                rect.top += subHeight;
                rect.bottom -= subHeight;

            }
        }

    }

    rect.top -= scrollTop;
    rect.bottom += scrollTop;

    return rect;

}
