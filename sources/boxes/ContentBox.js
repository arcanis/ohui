import { Box } from '../boxes/Box';

export class ContentBox extends Box {

    refreshX( ) {

        var fullBoxRect = this._context.get( true, false );

        this._rect.left = fullBoxRect.left;
        this._rect.right = fullBoxRect.right;
        this._rect.width = fullBoxRect.width;

        if ( this._element.activeStyle.border ) {

            this._rect.left += 1;
            this._rect.right += 1;

            this._rect.width -= 2;

            if ( this._rect.width < 0 ) {
                this._rect.width = 0;
            }

        }

    }

    refreshY( ) {

        var fullBoxRect = this._context.get( false, true );

        this._rect.top = fullBoxRect.top;
        this._rect.bottom = fullBoxRect.bottom;
        this._rect.height = fullBoxRect.height;

        if ( this._element.activeStyle.border ) {

            this._rect.top += 1;
            this._rect.bottom += 1;

            this._rect.height -= 2;

            if ( this._rect.height < 0 ) {
                this._rect.height = 0;
            }

        }

    }

}
