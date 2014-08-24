import { Box } from '../boxes/Box';

export class ClipBox extends Box {

    refreshX( ) {

        var innerRect = this._context.get( true, false );
        var parentClipRect = this._element.parentNode._clipContentBox.get( true, false );

        var doesIntersect =
            innerRect.left < parentClipRect.left + parentClipRect.width &&
            innerRect.left + innerRect.width > parentClipRect.left &&
            innerRect.width > 0 && parentClipRect.width > 0;

        if ( ! doesIntersect ) {

            this._rect.left = NaN;
            this._rect.right = NaN;

            this._rect.width = NaN;

        } else {

            this._rect.left = Math.max( innerRect.left, parentClipRect.left );
            this._rect.right = Math.max( innerRect.right, parentClipRect.right );

            this._rect.width = Math.min( innerRect.left + innerRect.width, parentClipRect.left + parentClipRect.width ) - this._rect.left;

        }

    }

    refreshY( ) {

        var innerRect = this._context.get( false, true );
        var parentClipRect = this._element.parentNode._clipContentBox.get( false, true );

        var doesIntersect =
            innerRect.top < parentClipRect.top + parentClipRect.height &&
            innerRect.top + innerRect.height > parentClipRect.top &&
            innerRect.height > 0 && parentClipRect.height > 0;

        if ( ! doesIntersect ) {

            this._rect.top = NaN;
            this._rect.bottom = NaN;

            this._rect.height = NaN;

        } else {

            this._rect.top = Math.max( innerRect.top, parentClipRect.top );
            this._rect.bottom = Math.max( innerRect.bottom, parentClipRect.bottom );

            this._rect.height = Math.min( innerRect.top + innerRect.height, parentClipRect.top + parentClipRect.height ) - this._rect.top;

        }

    }

}
