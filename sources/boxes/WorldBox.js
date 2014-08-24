import { Box } from '../boxes/Box';

export class WorldBox extends Box {

    refreshX( ) {

        var innerRect = this._context.get( true, false );

        this._rect.left = innerRect.left;
        this._rect.right = innerRect.right;
        this._rect.width = innerRect.width;

        if ( this._element.parentNode ) {

            var parentRect = this._element.parentNode._worldContentBox.get( true, false );

            this._rect.left += parentRect.left;
            this._rect.right += parentRect.right;

        }

    }

    refreshY( ) {

        var innerRect = this._context.get( false, true );

        this._rect.top = innerRect.top;
        this._rect.bottom = innerRect.bottom;
        this._rect.height = innerRect.height;

        if ( this._element.parentNode ) {

            var parentRect = this._element.parentNode._worldContentBox.get( false, true );

            this._rect.top += parentRect.top;
            this._rect.bottom += parentRect.bottom;

        }

    }

}
