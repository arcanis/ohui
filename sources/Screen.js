import   keypress             from 'keypress';
import   tput                 from 'node-tput';
import   stable               from 'stable';

import { TerminalBox }        from './boxes/TerminalBox';
import { applyTerminalColor } from './utilities/Color';
import { Event     }          from './utilities/Event';
import { Rect }               from './utilities/Rect';
import { Element }            from './Element';

var invalidUtf8Symbols = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/;

export class Screen extends Element {

    constructor( { stdin = process.stdin, stdout = process.stdout } = { } ) {

        super( { left : 0, right : 0, top : 0, bottom : 0 } );

        var terminalBox = new TerminalBox( this );
        this.elementBox = this.scrollElementBox = this.worldElementBox = this.clipElementBox = terminalBox;
        this.contentBox = this.scrollContentBox = this.worldContentBox = this.clipContentBox = terminalBox;

        this.activeElement = this;

        this._nodeList = null;
        this._renderList = null;

        this._pending = [ ];
        this._nextRedraw = null;

        this._in = stdin;
        this._out = stdout;

        this._in.setRawMode( true );

        keypress( this._in );
        keypress.enableMouse( this._out );

        this._out.write( tput( 'civis' ) );
        this._out.write( tput( 'clear' ) );

        this._out.on( 'resize', ( ) => {

            this.applyElementBoxInvalidatingActions( true, true, ( ) => {
                this._out.write( tput( 'clear' ) );
            } );

        } );

        this._in.on( 'keypress', ( data, key ) => {

            this._keyEvent( data, key );

        } );

        this._in.on( 'mousepress', ( e ) => {

            if ( e.release )
                return ;

            this._mouseEvent( e );

        } );

        process.on( 'exit', ( ) => {

            keypress.disableMouse( this._out );

            this._out.write( tput( 'rs2' ) );

        } );

        this.addShortcutListener( 'S-tab', e => {

            e.setDefault( ( ) => {

                this._focusRelativeElement( -1 );

            } );

        } );

        this.addShortcutListener( 'tab', e => {

            e.setDefault( ( ) => {

                this._focusRelativeElement( +1 );

            } );

        } );

        this.addShortcutListener( 'C-c', e => {

            e.setDefault( ( ) => {

                process.exit( );

            } );

        } );

        this.screenNode = this;

        this.prepareRedraw( );

    }

    invalidateNodeList( ) {

        this._nodeList = null;

        this.invalidateRenderList( );

    }

    invalidateRenderList( ) {

        this._renderList = null;

    }

    getNodeList( ) {

        if ( this._nodeList )
            return this._nodeList;

        var traverseList = [ this ];
        var nodeList = this._nodeList = [ ];

        while ( traverseList.length ) {

            var element = traverseList.shift( );
            nodeList.push( element );

            traverseList = element.childNodes.concat( traverseList );

        }

        return nodeList;

    }

    getRenderList( ) {

        if ( this._renderList )
            return this._renderList;

        var makeTreeNode = ( ) => ( { layers : { }, elements : [ ] } );

        var renderList = this._renderList = [ ];
        var renderTree = makeTreeNode( );
        var currentTreeNode = renderTree;

        var getLayer = zIndex => {

            if ( typeof currentTreeNode.layers[ zIndex ] === 'undefined' )
                currentTreeNode.layers[ zIndex ] = makeTreeNode( );

            return currentTreeNode.layers[ zIndex ];

        };

        var layeringVisitor = element => {

            if ( ! element.activeStyle.flags.isVisible )
                return ;

            var clipRect = element.clipElementBox.get( );

            if ( ! clipRect.width || ! clipRect.height )
                return ;

            var zIndex = element.activeStyle.zIndex;

            if ( zIndex != null ) {

                var previousTreeNode = currentTreeNode;
                currentTreeNode = getLayer( zIndex );

                currentTreeNode.elements.unshift( element );
                element.childNodes.forEach( child => { layeringVisitor( child ); } );

                currentTreeNode = previousTreeNode;

            } else {

                currentTreeNode.elements.unshift( element );
                element.childNodes.forEach( child => { layeringVisitor( child ); } );

            }

        };

        var flatteningVisitor = treeNode => {

            var layers = Object.keys( treeNode.layers ).sort( ( a, b ) => a - b );

            layers.forEach( zIndex => { flatteningVisitor( treeNode.layers[ zIndex ] ); } );

            treeNode.elements.forEach( element => { renderList.push( element ); } );

        };

        layeringVisitor( this );
        flatteningVisitor( renderTree );

        return renderList;

    }

    prepareRedrawRect( redrawRect ) {

        if ( ! redrawRect.width || ! redrawRect.height )
            return this;

        this._queueRedraw( [ redrawRect ] );

        if ( ! this._nextRedraw ) {
            this._nextRedraw = setImmediate( ( ) => {
                this._nextRedraw = null;
                this._redraw( );
            } );
        }

        return this;

    }

    _keyEvent( data, key ) {

        if ( ! data || invalidUtf8Symbols.test( data ) )
            data = null;

        if ( data && ! key && data.length === 1 )
            key = { ctrl : false, shift : false, meta : false, name : data };

       if ( ! data && ! key )
            return ;

        var keyDef = key ? { control : key.ctrl, shift : key.shift, meta : key.meta, key : key.name } : null;
        var dataEvent = new Event( 'data', { target : this.activeElement, data : data, key : keyDef } );

        for ( var element = dataEvent.target; element; element = element.parentNode )
            element.dispatchEvent( dataEvent );

        dataEvent.resolveDefault( );

    }

    /**
     */

    _mouseEvent( e ) {

        var x = e.x - 1, y = e.y - 1;

        var renderList = this.getRenderList( );

        for ( var t = 0, T = renderList.length; t < T; ++ t ) {

            var element = renderList[ t ];
            var clipBox = element.clipElementBox.get( );

            if ( x < clipBox.left || x >= clipBox.left + clipBox.width )
                continue ;
            if ( y < clipBox.top || y >= clipBox.top + clipBox.height )
                continue ;

            if ( e.scroll ) {

                var event = new Event( 'scroll', { target : element, direction : e.scroll } );

                for ( ; element; element = element.parentNode )
                    element.dispatchEvent( event );

                event.setDefault( ( ) => {

                    var element = event.target;

                    while ( element && ! element.scrollBy )
                        element = element.parentNode;

                    if ( element ) {
                        element.scrollBy( e.scroll * 3 );
                    }

                } );

                event.resolveDefault( );

            } else {

                var event = new Event( 'click', { target : element } );

                for ( ; element; element = element.parentNode )
                    element.dispatchEvent( event );

                event.setDefault( ( ) => {

                    var element = event.target;

                    while ( element && ! element.activeStyle.focusable )
                        element = element.parentNode;

                    if ( element ) {
                        element.focus( );
                    }

                } );

                event.resolveDefault( );

            }

            break ;

        }

    }

    /**
     * Render every requested rects. Each rect will be matched against every element of the scene, front-to-back.
     *
     * Once a rect matches, the rendering will go to the next rect without rendering the following elements; ie. there is no transparency.
     */

    _redraw( ) {

        var buffer = '';

        var renderList = this.getRenderList( );

        while ( this._pending.length > 0 ) {

            var dirtyRect = this._pending.shift( );

            for ( var t = 0, T = renderList.length; t < T; ++ t ) {

                var element = renderList[ t ];

                var fullRect = element.worldElementBox.get( );
                var clipRect = element.clipElementBox.get( );

                if ( ! clipRect.width || ! clipRect.height )
                    continue ;

                var intersection = clipRect.intersection( dirtyRect );

                if ( ! intersection )
                    continue ;

                var truncation = dirtyRect.exclude( intersection );
                this._queueRedraw( truncation.slice( ) );

                for ( var y = 0, Y = intersection.height; y < Y; ++ y ) {

                    var relativeX = intersection.left - fullRect.left;
                    var relativeY = intersection.top - fullRect.top + y;

                    var line = element.renderLine( relativeX, relativeY, intersection.width );

                    if ( line.length < intersection.width )
                        line += new Array( intersection.width - line.length + 1 ).join( element.activeStyle.ch || ' ' );

                    line = line.toString( );

                    if ( element.activeStyle.color )
                        line = applyTerminalColor( element.activeStyle.color.fg, element.activeStyle.color.bg ) + line;

                    if ( line.indexOf( '\x1b' ) !== -1 )
                        line = line + tput( 'sgr0' );

                    buffer += tput( 'cup', intersection.top + y, intersection.left );
                    buffer += line;

                }

                break ;

            }

        }

        this._out.write( buffer );

    }

    _queueRedraw( redrawList ) {

        while ( redrawList.length > 0 ) {

            var redrawRect = new Rect( redrawList.shift( ) );

            for ( var t = 0, T = this._pending.length; t < T; ++ t ) {

                var intersection = redrawRect.intersection( this._pending[ t ] );

                if ( intersection ) {

                    redrawList = redrawRect
                        .exclude( intersection )
                        .concat( redrawList );

                    break ;

                }

            }

            if ( t === T ) {

                this._pending.push( redrawRect );

            }

        }

    }

    _focusRelativeElement( relativeOffset ) {

        if ( relativeOffset === 0 )
            return ;

        var direction = relativeOffset < 0 ? -1 : +1;
        relativeOffset = Math.abs( relativeOffset );

        var nodeList = this.getNodeList( );
        var nodeIndex = nodeList.indexOf( this.activeElement );

        var next = function ( base ) {
            if ( base === 0 && direction === -1 )
                return nodeList.length - 1;

            if ( base === nodeList.length - 1 && direction === 1 )
                return 0;

            return base + direction;

        };

        if ( nodeIndex === -1 ) {

            if ( direction > 0 ) {
                nodeList[ 0 ].focus( );
            } else {
                nodeList[ nodeList.length - 1 ].focus( );
            }

        } else for ( ; relativeOffset !== 0; -- relativeOffset ) {

            var nextIndex = next( nodeIndex );

            while ( nextIndex !== nodeIndex && ! nodeList[ nextIndex ].activeStyle.focusable )
                nextIndex = next( nextIndex );

            if ( nextIndex === nodeIndex )
                break ;

            nodeIndex = nextIndex;

        }

        nodeList[ nodeIndex ].focus( );

    }

}
