import { Box } from '../boxes/Box';

export class ScrollBox extends Box {

    refreshSize( axis ) {

        var contextBoxRect = this._context[ axis.get ]( );

        this._rect[ axis.size ] = contextBoxRect[ axis.size ];

    }

    refreshPosition( axis ) {

        var scroll = this._element.activeStyle.flags.staticPositioning ||
                     this._element.activeStyle.position === 'absolute' ?
            this._element.parentNode[ axis.scrollPosition ] : 0;

        var contextBoxRect = this._context[ axis.get ]( );

        this._rect[ axis.a ] = contextBoxRect[ axis.a ] - scroll;
        this._rect[ axis.b ] = contextBoxRect[ axis.b ] + scroll;

    }

}
