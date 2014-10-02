import   extend             from 'extend';

import { ClipBox }          from './boxes/ClipBox';
import { ContentBox }       from './boxes/ContentBox';
import { ElementBox }       from './boxes/ElementBox';
import { ScrollBox }        from './boxes/ScrollBox';
import { WorldBox }         from './boxes/WorldBox';
import { Event }            from './utilities/Event';
import { KeySequence }      from './utilities/KeySequence';
import { Rect }             from './utilities/Rect';
import { percentageRegexF } from './constants';

var elementUniqueId = 0;

// This array is used to avoid invalidating some rects multiple times
var rectInvalidationList = [ ];

export class Element {

    /**
     */

    constructor( style = { } ) {

        this.id = ++ elementUniqueId;

        this.style = extend( true, { position : 'static', width : 'auto', height : 'auto' }, style );
        this.activeStyle = { flags : { } };

        this.screenNode = null;
        this.parentNode = null;

        this.previousSibling = null;
        this.nextSibling = null;

        this.childNodes = [ ];

        this.scrollTop = 0;
        this.scrollLeft = 0;

        this.scrollWidth = 0;
        this.scrollHeight = 0;

        this.elementBox = new ElementBox( this );
        this.contentBox = new ContentBox( this.elementBox );

        this.scrollElementBox = new ScrollBox( this.elementBox );
        this.scrollContentBox = new ScrollBox( this.contentBox );

        this.worldElementBox = new WorldBox( this.scrollElementBox );
        this.worldContentBox = new WorldBox( this.scrollContentBox );

        this.clipElementBox = new ClipBox( this.worldElementBox );
        this.clipContentBox = new ClipBox( this.worldContentBox );

        this._events = { };

        this.declareEvent( 'data' );
        this.declareEvent( 'scroll' );
        this.declareEvent( 'click' );
        this.declareEvent( 'focus' );
        this.declareEvent( 'blur' );

        this.refreshActiveStyles( );

        Object.defineProperty( this, 'scrollWidth', {

            get : ( ) => this.childNodes.reduce( ( max, element ) => {

                if ( ! element.activeStyle.flags.staticPositioning )
                    return max;

                var childWidth = element.elementBox.getWidth( );
                return Math.max( max, childWidth );

            }, 0 )

        } );

        Object.defineProperty( this, 'scrollHeight', {

            get : ( ) => this.childNodes.reduce( ( sum, child ) => {

                if ( ! child.activeStyle.flags.staticPositioning )
                    return sum;

                var childHeight = child.contentBox.getHeight( );
                return sum + childHeight;

            }, 0 )

        } );

    }

    /**
     */

    setStyle( name, value ) {

        var namespaces = name.split( /\./g );
        var property = namespaces.shift( );

        var what = this.style;

        while ( namespaces.length > 0 ) {

            var namespace = namespaces.shift( );

            if ( typeof what[ namespace ] !== 'object' || what[ namespace ] === null )
                what[ namespace ] = { };

            what = what[ namespace ];

        }

        what[ property ] = value;

        this.refreshActiveStyles( );

    }

    /**
     */

    setStyles( style ) {

        extend( true, this.style, style );

        this.refreshActiveStyles( );

    }

    /**
     * Add an element at the end of the childNodes array.
     *
     * If the child is already the child of another element, it will be removed from that other element before adding it to the new parent.
     */

    appendChild( element ) {

        if ( element.parentNode )
            element.parentNode.removeChild( element );

        return this.applyElementBoxInvalidatingActions( true, true, ( ) => {

            element.screenNode = this.screenNode;
            element.parentNode = this;

            element._cascadeScreenNode( );

            if ( this.childNodes.length !== 0 ) {
                element.previousSibling = this.childNodes[ this.childNodes.length - 1 ];
                this.childNodes[ this.childNodes.length - 1 ].nextSibling = element;
            }

            this.childNodes.push( element );

            if ( ! this.firstChild )
                this.firstChild = element;

            this.lastChild = element;

            if ( this.screenNode ) {
                this.screenNode.invalidateNodeList( );
            }

        } );

    }

    /**
     * Remove an element from the childNodes array.
     */

    removeChild( element ) {

        if ( element.parentNode !== this )
            return this;

        return this.applyElementBoxInvalidatingActions( true, true, ( ) => {

            var screenNode = element.screenNode;

            element.elementBox.invalidate( );

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

            element._cascadeScreenNode( );

            element.previousSibling = null;
            element.nextSibling = null;

            var index = this.childNodes.indexOf( element );
            this.childNodes.splice( index, 1 );

            if ( screenNode ) {
                screenNode.invalidateNodeList( );
            }

        } );

    }

    /**
    */

    scrollIntoView( anchor ) {

        if ( ! this.parentNode )
            return this;

        var elementBox = this.elementBox.get( );
        var top = elementBox.top, height = elementBox.height;

        var parentScrollTop = this.parentNode.scrollTop;
        var parentHeight = this.parentNode.contentBox.get( ).height;

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

            default:
            throw new Error( 'Invalid scroll anchor' );

        }

        return this;

    }

    /**
     */

    focus( ) {

        if ( ! this.screenNode || this.screenNode.activeElement === this )
            return this;

        this.screenNode.activeElement.blur( );

        this.screenNode.activeElement = this;
        this.refreshActiveStyles( );

        var event = new Event( 'focus', { target : this, cancelable : false } );
        this.dispatchEvent( event );

        return this;

    }

    /**
     */

    blur( ) {

        if ( ! this.screenNode || this.screenNode.activeElement !== this )
            return this;

        this.screenNode.activeElement = this.screenNode;
        this.refreshActiveStyles( );

        var event = new Event( 'blur', { target : this, cancelable : false } );
        this.dispatchEvent( event );

        return this;

    }

    /**
     */

    declareEvent( name ) {

        if ( this._events[ name ] )
            throw new Error( 'Event already declared: ' + name );

        this._events[ name ] = { userActions : [ ], defaultActions : [ ] };

        return this;

    }

    /**
     */

    dispatchEvent( event ) {

        var name = event.name;

        if ( ! this._events[ name ] )
            throw new Error( 'Invalid event name "' + name + '"' );

        var listeners = this._events[ name ];

        event.currentTarget = this;

        for ( var t = 0, T = listeners.userActions.length; t < T; ++ t )
            listeners.userActions[ t ].call( this, event );

        for ( var t = 0, T = listeners.defaultActions.length; t < T && ! event.isDefaultPrevented( ); ++ t )
            listeners.defaultActions[ t ].call( this, event );

        return this;

    }

    /**
     */

    addEventListener( name, callback, { isDefaultAction } = { } ) {

        if ( ! this._events[ name ] )
            throw new Error( 'Invalid event name "' + name + '"' );

        if ( isDefaultAction ) {
            this._events[ name ].defaultActions.unshift( callback );
        } else {
            this._events[ name ].userActions.push( callback );
        }

        return this;

    }

    /**
     */

    addShortcutListener( sequence, callback, options ) {

        var sequence = new KeySequence( sequence );

        this.addEventListener( 'data', e => {

            if ( ! e.key )
                return ;

            if ( ! sequence.match( e.key ) )
                return ;

            callback.call( this, e );

        }, options );

        return this;

    }

    /**
     */

    applyElementBoxInvalidatingActions( invalidateX, invalidateY, invalidatingActionsCallback ) {

        // "topMostInvalidation" contains a reference to the top-most invalidated element
        // "invalidatedElement" contains the full set of invalidated elements

        var topMostInvalidation = null;
        var invalidatedElements = [ ];

        // First step, we push the element itself

        invalidatedElements.push( this );

        // Second step, we push every direct flexible-size parents of the element

        for ( var parent = this.parentNode; parent; parent = parent.parentNode ) {

            invalidatedElements.push( parent );

            var shouldBreakX = ! invalidateX || ! parent.activeStyle.flags.hasAdaptiveWidth;
            var shouldBreakY = ! invalidateY || ! parent.activeStyle.flags.hasAdaptiveHeight;

            if ( shouldBreakX && shouldBreakY ) {
                break ;
            }

        }

        topMostInvalidation = invalidatedElements[ invalidatedElements.length - 1 ];

        // (-invalidateY only-) Third step, each of those invalidated element has to update its following siblings too, but only when they have "static" / "relative" positioning
        // We don't need to do this if we're invalidating the X-axis only, because OhUI! does not handle horizontal rendering yet

        if ( invalidateY ) {

            invalidatedElements.forEach( element => {

                if ( ! element.activeStyle.flags.staticPositioning )
                    return ;

                while ( ( element = element.nextSibling ) ) {
                    if ( element.activeStyle.flags.staticPositioning ) {
                        invalidatedElements.push( element );
                    }
                }

            } );

        }

        // Fourth step, we're preparing a rendering of the top-most invalidated element
        // (If the element shrinks, then having prepared a redraw now allow us to remove the extraneous space)

        if ( this.screenNode )
            this.screenNode.prepareRedraw( topMostInvalidation.clipElementBox.get( ) );

        // Fifth step, we execute all the commands that will invalidate the box of our elements

        invalidatingActionsCallback( );

        // Sixth step, each invalidated element also has to invalidate its children using relative sizes - recursively
        // Wanna know why we're doing it here rather than in fourth step? It's because the "invalidating actions" may have be to add (or remove) a child!

        var invalidatedElementsPass = invalidatedElements;

        var cycle = function ( ) {

            var currentInvalidatedElementPass = invalidatedElementsPass;
            invalidatedElementsPass = [ ];

            currentInvalidatedElementPass.forEach( element => {
                element.childNodes.forEach( child => {
                    if ( invalidatedElements.indexOf( child ) === -1 ) {
                        invalidatedElementsPass.push( child );
                        invalidatedElements.push( child );
                    }
                } );
            } );

        };

        while ( invalidatedElementsPass.length )
            cycle( );

        // Seventh step, we can now actually invalidate the elements

        invalidatedElements.forEach( element => {
            element.elementBox.invalidate( ); } );

        // Eighth step, we're preparing a rendering of the top-most invalidated element
        // Don't forget to invalidate the render list: if the element shrinks, then previously hidden elements may be reveled
        // (We're doing it another time, in case the element grows)

        if ( this.screenNode ) {
            this.screenNode.invalidateRenderList( );
            this.screenNode.prepareRedraw( topMostInvalidation.clipElementBox.get( ) );
        }

        return this;

    }

    /**
     */

    prepareRedraw( ) {

        if ( ! this.screenNode )
            return ;

        this.screenNode.prepareRedrawRect( this.clipElementBox.get( ) );

    }

    /**
     */

    renderLine( x, y, l ) {

        return new Array( l + 1 ).join( this.activeStyle.ch || ' ' );

    }

    /**
     */

    refreshActiveStyles( ) {

        var style = extend( true, { }, this.style );

        if ( this.screenNode && this.screenNode.activeElement === this )
            extend( true, style, style.active );

        if ( style.position === 'static' || style.position === 'relative' )
            style.left = style.right = style.top = style.bottom = null;

        if ( style.left != null && style.right != null )
            style.width = style.minWidth = style.maxWidth = null;

        if ( style.top != null && style.bottom != null )
            style.height = style.minHeight = style.maxHeight = null;

        if ( style.width === 'auto' )
            style.width = '100%';

        if ( style.height === 'auto' )
            style.height = 'adaptive';

        extend( true, style, { flags : {
            isVisible : style.display !== 'none',
            staticPositioning : style.position === 'static' || style.position === 'relative',
            absolutePositioning : style.position === 'absolute' || style.position === 'fixed',
            parentRelativeWidth : ( style.left != null && style.right != null ) || [ style.left, style.right, style.width, style.minWidth, style.maxWidth ].some( value => percentageRegexF.test( value ) ),
            parentRelativeHeight : ( style.top != null && style.bottom != null ) || [ style.top, style.bottom, style.height, style.minHeight, style.maxHeight ].some( value => percentageRegexF.test( value ) ),
            hasAdaptiveWidth : style.width === 'adaptive',
            hasAdaptiveHeight : style.height === 'adaptive'
        } } );

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

        var dirtyContentBox = [ 'border', 'ch', 'textAlign' ].some( changed );
        var dirtyElementBoxesX = [ 'position', 'left', 'right', 'width', 'minWidth', 'maxWidth' ].some( changed );
        var dirtyElementBoxesY = [ 'position', 'top', 'bottom', 'height', 'minHeight', 'maxHeight' ].some( changed );
        var dirtyRenderList = [ 'display', 'zIndex' ].some( changed );

        var actions = ( ) => { this.activeStyle = newActiveStyle; };
        this.applyElementBoxInvalidatingActions( true, true, actions );

        if ( this.screenNode && dirtyRenderList ) {
            this.screenNode.invalidateRenderList( );
        }

    }

    _cascadeScreenNode( ) {

        for ( var child of this.childNodes ) {
            child.screenNode = this.screenNode;
            child._cascadeScreenNode( );
        }

    }

}
