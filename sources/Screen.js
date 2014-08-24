import   keypress      from 'keypress';
import   tput          from 'node-tput';
import   stable        from 'stable';

import { TerminalBox } from './boxes/TerminalBox';
import { Event     }   from './utilities/Event';
import { Rect }        from './utilities/Rect';
import { Element }     from './Element';

export class Screen extends Element {

    constructor( { stdin = process.stdin, stdout = process.stdout } = { } ) {

        super( { left : 0, right : 0, top : 0, bottom : 0 } );

        var terminalBox = new TerminalBox( this );
        this._elementBox = this._worldElementBox = this._clipElementBox = terminalBox;
        this._contentBox = this._worldContentBox = this._clipContentBox = terminalBox;

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
            this._out.write( tput( 'clear' ) );
            this.invalidateRects( );
            this._prepareRedrawSelf( );
        } );

        var nonPrintable = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/;

        this._in.on( 'keypress', ( data, e ) => {
            if ( data && ! nonPrintable.test( data ) ) this._dataEvent( data );
            if ( e ) this._keyEvent( e );
        } );

        this._in.on( 'mousepress', ( e ) => {
            if ( e.release ) return ;
            this._mouseEvent( e );
        } );

        process.on( 'exit', ( ) => {
            keypress.disableMouse( this._out );
            this._out.write( tput( 'rs2' ) );
        } );

        this.addShortcutListener( '↑-tab', e => {
            if ( e.isDefaultPrevented( ) ) return ;
            this._focusRelativeElement( -1 );
        } );

        this.addShortcutListener( 'tab', e => {
            if ( e.isDefaultPrevented( ) ) return ;
            this._focusRelativeElement( +1 );
        } );

        this.addShortcutListener( 'home', e => {
            if ( e.isDefaultPrevented( ) ) return ;
            if ( ! e.target.scrollTo ) return ;
            e.target.scrollTo( 0 );
        } );

        this.addShortcutListener( 'end', e => {
            if ( e.isDefaultPrevented( ) ) return ;
            if ( ! e.target.scrollTo ) return ;
            e.target.scrollTo( Infinity );
        } );

        this.addShortcutListener( 'up', e => {
            if ( e.isDefaultPrevented( ) ) return ;
            if ( ! e.target.scrollBy ) return ;
            e.target.scrollBy( -1 );
        } );

        this.addShortcutListener( 'down', e => {
            if ( e.isDefaultPrevented( ) ) return ;
            if ( ! e.target.scrollBy ) return ;
            e.target.scrollBy( +1 );
        } );

        this.addShortcutListener( 'pageup', e => {
            if ( e.isDefaultPrevented( ) ) return ;
            if ( ! e.target.scrollBy ) return ;
            e.target.scrollBy( -10 );
        } );

        this.addShortcutListener( 'pagedown', e => {
            if ( e.isDefaultPrevented( ) ) return ;
            if ( ! e.target.scrollBy ) return ;
            e.target.scrollBy( +10 );
        } );

        this.addShortcutListener( 'C-c', e => {
            if ( e.isDefaultPrevented( ) ) return ;
            process.exit( );
        } );

        this.screenNode = this;

        this._prepareRedrawSelf( );

    }

    appendChild( element ) {

        super( element );

        var stack = [ element ];

        while ( stack.length > 0 ) {

            var current = stack.shift( );
            current.screenNode = this;

            stack = stack.concat( current.childNodes );

        }

        this.invalidateNodeList( );

        element._prepareRedrawSelf( );

        return this;

    }

    removeChild( element ) {

        if ( element.parentNode === this )
            element._prepareRedrawSelf( );

        super( element );

        return this;

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

            traverseList = traverseList.concat( element.childNodes );

        }

        return nodeList;

    }

    getRenderList( ) {

        if ( this._renderList )
            return this._renderList;

        var renderList = this._renderList = stable( this.getNodeList( ).filter( element => {

            var clipRect = element.getClipElementBox( );
            return clipRect.width && clipRect.height;

        } ), ( a, b ) => {

            return ( a.activeStyle.zIndex | 0 ) > ( b.activeStyle.zIndex | 0 );

        } ).reverse( );

        return renderList;

    }

    prepareRedraw( rect ) {

        if ( ! rect.width || ! rect.height )
            return this;

        if ( this._pending.some( other => other.contains( rect ) ) )
            return this;

        this._pending.push( rect );

        if ( this._nextRedraw )
            return this;

        this._nextRedraw = setImmediate( ( ) => {
            this._nextRedraw = null;
            this._redraw( );
        } );

        return this;

    }

    /**
     */

    _dataEvent( data ) {

        var element = this.activeElement;
        var event = new Event( 'data', { target : element, data : data.toString( ) } );

        for ( ; element; element = element.parentNode ) {
            element.dispatchEvent( event );
        }

    }

    /**
     */

    _keyEvent( e ) {

        var element = this.activeElement;
        var event = new Event( 'keypress', { target : element, control : e.ctrl, shift : e.shift, meta : e.meta, key : e.name } );

        for ( ; element; element = element.parentNode ) {
            element.dispatchEvent( event );
        }

    }

    /**
     */

    _mouseEvent( e ) {

        var x = e.x - 1, y = e.y - 1;

        var renderList = this.getRenderList( );

        for ( var t = 0, T = renderList.length; t < T; ++ t ) {

            var element = renderList[ t ];
            var clipBox = element.getClipElementBox( );

            if ( ! element.activeStyle.focusable )
                continue ;

            if ( x < clipBox.left || x >= clipBox.left + clipBox.width )
                continue ;
            if ( y < clipBox.top || y >= clipBox.top + clipBox.height )
                continue ;

            if ( e.scroll ) {

                var event = new Event( 'scroll', { target : element, direction : e.scroll } );

                for ( ; element; element = element.parentNode )
                    element.dispatchEvent( event );

                if ( ! event.isDefaultPrevented( ) ) {
                    event.target.scrollBy( e.scroll );
                }

            } else {

                var event = new Event( 'click', { target : element } );

                for ( ; element; element = element.parentNode )
                    element.dispatchEvent( event );

                if ( ! event.isDefaultPrevented( ) ) {
                    event.target.focus( );
                }

            }

            break ;

        }

    }

    /**
     * Render a background line
     */

    _renderLine( x, y, l ) {

        return new Array( l + 1 ).join( this.activeStyle.ch || ' ' );

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

                var fullRect = element.getWorldElementBox( );
                var clipRect = element.getClipElementBox( );

                if ( ! clipRect.width || ! clipRect.height )
                    continue ;

                var intersection = clipRect.intersection( dirtyRect );

                if ( ! intersection )
                    continue ;

                var exclusion = dirtyRect.exclude( intersection );
                this._pending = this._pending.concat( exclusion );

                for ( var y = 0, Y = intersection.height; y < Y; ++ y ) {

                    var relativeX = intersection.left - fullRect.left;
                    var relativeY = intersection.top - fullRect.top + y;

                    buffer += tput( 'cup', intersection.top + y, intersection.left );
                    buffer += element._renderLine( relativeX, relativeY, intersection.width );

                }

                break ;

            }

        }

        this._out.write( buffer );

    }

}
