import { Rect } from '../utilities/Rect';

export class Box {

    constructor( context ) {

        this._dirtyX = true;
        this._dirtyY = true;

        this._context = context;
        this._rect = new Rect( );

        this._invalidateList = [ ];

        if ( this._context instanceof Box ) {

            this._context._invalidateList.push( this );
            this._element = this._context._element;

        } else {

            this._element = this._context;

        }

    }

    invalidate( invalidateX = true, invalidateY = true ) {

        if ( ! invalidateX && ! invalidateY )
            return this;

        if ( invalidateX )
            this._dirtyX = true;

        if ( invalidateY )
            this._dirtyY = true;

        this._invalidateList.forEach( box => {
            box.invalidate( invalidateX, invalidateY );
        } );

        return this;

    }

    get( refreshX = true, refreshY = true ) {

        if ( refreshX && this._dirtyX ) {
            this.refreshX( );
            this._dirtyX = false;
        }

        if ( refreshY && this._dirtyY ) {
            this.refreshY( );
            this._dirtyY = false;
        }

        return this._rect;

    }

};
