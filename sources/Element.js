import   extend        from 'extend';

import { ClipBox }     from './boxes/ClipBox';
import { ContentBox }  from './boxes/ContentBox';
import { ElementBox }  from './boxes/ElementBox';
import { ScrollBox }   from './boxes/ScrollBox';
import { WorldBox }    from './boxes/WorldBox';
import { Event }       from './utilities/Event';
import { KeySequence } from './utilities/KeySequence';
import { Rect }        from './utilities/Rect';

var elementUniqueId = 0;

// This array is used to avoid invalidating some rects multiple times
var rectInvalidationList = [ ];

export class Element {

    constructor( style = { } ) {

        this._events = { };

        this._events[ 'data' ] = [ ];
        this._events[ 'keypress' ] = [ ];
        this._events[ 'click' ] = [ ];
        this._events[ 'focus' ] = [ ];
        this._events[ 'blur' ] = [ ];

        this._elementBox = new ElementBox( this );
        this._contentBox = new ContentBox( this._elementBox );

        this._scrollElementBox = new ScrollBox( this._elementBox );
        this._scrollContentBox = new ScrollBox( this._contentBox );

        this._worldElementBox = new WorldBox( this._scrollElementBox );
        this._worldContentBox = new WorldBox( this._scrollContentBox );

        this._clipElementBox = new ClipBox( this._worldElementBox );
        this._clipContentBox = new ClipBox( this._worldContentBox );

        this.id = ++ elementUniqueId;

        this.style = style;
        this.activeStyle = { };

        this.screenNode = null;
        this.parentNode = null;

        this.previousSibling = null;
        this.nextSibling = null;

        this.childNodes = [ ];

        this.scrollTop = 0;
        this.scrollHeight = 0;

        this._computeActiveStyles( );

    }

    /**
     * Add an element at the end of the childNodes array.
     *
     * If the child is already the child of another element, it will be removed from that other element before adding it to the new parent.
     */

    appendChild( element ) {

        if ( element.parentNode )
            element.parentNode.removeChild( element );

        element.screenNode = this.screenNode;
        element.parentNode = this;

        if ( this.childNodes.length !== 0 ) {
            element.previousSibling = this.childNodes[ this.childNodes.length - 1 ];
            this.childNodes[ this.childNodes.length - 1 ].nextSibling = element;
        }

        this.childNodes.push( element );

        if ( ! this.firstChild )
            this.firstChild = element;

        this.lastChild = element;

        element.invalidateRects( );

        if ( this.screenNode )
            this.screenNode.invalidateNodeList( );

        return this;

    }

    /**
     * Remove an element from the childNodes array.
     */

    removeChild( element ) {

        if ( element.parentNode !== this )
            return this;

        var screenNode = element.screenNode;

        element.invalidateRects( );

        if ( this.lastChild === element )
            this.lastChild = element.previousSibling;

        if ( this.firstChild === element )
            this.firstChild = element.nextSibling;

        if ( element.previousSibling )
            element.previousSibling.nextSibling = element.nextSibling;

        if ( element.nextSibling )
            element.nextSibling.previousSibling = element.previousSibling;

        element.screenNode = null;
        element.parentNode = null;

        element.previousSibling = null;
        element.nextSibling = null;

        var index = this.childNodes.indexOf( element );
        this.childNodes.splice( index, 1 );

        if ( screenNode )
            screenNode.invalidateNodeList( );

        return this;

    }

    invalidateRects( invalidateX = true, invalidateY = true, bubbleUp = true ) {

        if ( ! invalidateX && ! invalidateY )
            return this;

        this._elementBox.invalidate( invalidateX, invalidateY );

        if ( bubbleUp && this.parentNode )
            this.parentNode.invalidateRects( invalidateX, invalidateY );

        this.childNodes.forEach( element => {
            element.invalidateRects( invalidateX, invalidateY, false );
        } );

        return this;

    }

    getElementBox( ) {

        return this._elementBox.get( );

    }

    getContentBox( ) {

        return this._contentBox.get( );

    }

    getScrollElementBox( ) {

        return this._scrollElementBox.get( );

    }

    getScrollContentBox( ) {

        return this._scrollContentBox.get( );

    }

    getWorldElementBox( ) {

        return this._worldElementBox.get( );

    }

    getWorldContentBox( ) {

        return this._worldContentBox.get( );

    }

    getClipElementBox( ) {

        return this._clipElementBox.get( );

    }

    getClipContentBox( ) {

        return this._clipContentBox.get( )

    }

    scrollIntoView( anchor ) {

        var elementBox = this.getElementBox( );
        var top = elementBox.top, height = elementBox.height;

        var parentScrollTop = this.parentNode.scrollTop;
        var parentHeight = this.parentNode.getContentBox( ).height;

        if ( top >= parentScrollTop && top + height < parentScrollTop + parentHeight )
            return this;

        if ( typeof anchor === 'undefined' ) {
            if ( top <= parentScrollTop ) {
                anchor = 'top';
            } else {
                anchor = 'bottom';
            }
        }

        switch ( anchor ) {

            case 'top':
                this.parentNode.scrollTo( top );
            break ;

            case 'bottom':
                this.parentNode.scrollTo( top + height - parentHeight );
            break ;

            default :
            throw new Error( 'Invalid scroll anchor' );

        }

        return this;

    }

    focus( ) {

        if ( ! this.screenNode || this.screenNode.activeElement === this )
            return this;

        this.screenNode.activeElement.blur( );

        this.screenNode.activeElement = this;
        this._computeActiveStyles( );

        var event = new Event( 'focus', { target : this, cancelable : false } );
        this.dispatchEvent( event );

        return this;

    }

    blur( ) {

        if ( ! this.screenNode || this.screenNode.activeElement !== this )
            return this;

        this.screenNode.activeElement = this.screenNode;
        this._computeActiveStyles( );

        var event = new Event( 'blur', { target : this, cancelable : false } );
        this.dispatchEvent( event );

        return this;

    }

    dispatchEvent( event ) {

        var name = event.name;

        if ( ! this._events[ name ] )
            throw new Error( 'Invalid event name "' + name + '"' );

        var listeners = this._events[ name ];

        event.currentTarget = this;

        for ( var t = 0, T = listeners.length; t < T; ++ t )
            listeners[ t ].call( this, event );

        return this;

    }

    addEventListener( name, callback ) {

        if ( ! this._events[ name ] )
            throw new Error( 'Invalid event name "' + name + '"' );

        this._events[ name ].push( callback );

        return this;

    }

    addShortcutListener( sequence, callback ) {

        var sequence = new KeySequence( sequence );

        this.addEventListener( 'keypress', e => {
            if ( sequence.match( e ) )
                callback.call( this, e ); } );

        return this;

    }

    _computeActiveStyles( ) {

        var style = extend( true, { }, this.style );

        if ( this.screenNode && this.screenNode.activeElement === this )
            extend( true, style, style.active );

        extend( true, style, {
            position : style.top == null && style.bottom == null ? 'static' : 'absolute'
        } );

        this._switchActiveStyle( style );

    }

    /**
     * Change the style of the element. If required, reset some internal properties in order to compute them again later.
     *
     * - left/right/width require an update of the element boxes X axis
     * - top/bottom/height require an update of the element boxes Y axis
     * - border require an update of all the element boxes
     * - zIndex changes require to refresh the screen render list (in order to sort it again)
     */

    _switchActiveStyle( newActiveStyle ) {

        var changed = property => newActiveStyle[ property ] !== this.activeStyle[ property ];

        var dirtyXBoxes = [ 'border', 'left', 'right', 'width' ].some( changed );
        var dirtyYBoxes = [ 'border', 'top', 'bottom', 'height' ].some( changed );
        var dirtyRenderList = [ 'zIndex' ].some( changed );

        if ( dirtyXBoxes || dirtyYBoxes ) {
            this._prepareRedrawSelf( );
            this.invalidateRects( dirtyXBoxes, dirtyYBoxes );
        }

        this.activeStyle = newActiveStyle;

        if ( dirtyRenderList && this.screenNode )
            this.screenNode._clearRenderList( );

        this._prepareRedrawSelf( );

        this.foo = true;

    }

    /**
     * Ask the top-most screen element to redraw the element clip rect when possible.
     */

    _prepareRedrawSelf( ) {

        if ( ! this.screenNode )
            return ;

        this.screenNode.prepareRedraw( this.getClipElementBox( ) );

    }

}
