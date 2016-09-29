import { Box } from '../boxes/Box';

export class TerminalBox extends Box {

    constructor( ... args ) {

        super( ... args );

        this._rect.left = this._rect.right = 0;
        this._rect.top = this._rect.bottom = 0;

    }

    refreshSize( axis ) {

        this._rect.width = this._element._out.columns;
        this._rect.height = this._element._out.rows;

    }

    refreshPosition( axis ) {

    }

}
