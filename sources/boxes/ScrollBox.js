import { Box } from '../boxes/Box';

export class ScrollBox extends Box {

    refreshX( ) {

        var elementBox = this._context.get( true, false );

        this._rect.left = elementBox.left;
        this._rect.right = elementBox.right;
        this._rect.width = elementBox.width;

    }

    refreshY( ) {

        var scrollTop = this._element.activeStyle.position === 'static' ?
            this._element.parentNode.scrollTop : 0;

        var elementBox = this._context.get( false, true );

        this._rect.top = elementBox.top - scrollTop;
        this._rect.bottom = elementBox.bottom + scrollTop;
        this._rect.height = elementBox.height;

    }

}
