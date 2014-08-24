import { Box } from '../boxes/Box';

export class TerminalBox extends Box {

    refreshX( ) {

        this._rect.left = 0;
        this._rect.right = 0;

        this._rect.width = this._element._out.columns;

    }

    refreshY( ) {

        this._rect.top = 0;
        this._rect.bottom = 0;

        this._rect.height = this._element._out.rows;

    }

}
