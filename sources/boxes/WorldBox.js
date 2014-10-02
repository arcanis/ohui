import { Box } from '../boxes/Box';

export class WorldBox extends Box {

    refreshSize( axis ) {

        this._rect[ axis.size ] = this._context[ axis.getSize ]( );

    }

    refreshPosition( axis ) {

        var contextBoxRect = this._context[ axis.get ]( );

        this._rect[ axis.a ] = contextBoxRect[ axis.a ];
        this._rect[ axis.b ] = contextBoxRect[ axis.b ];

        if ( this._element.parentNode ) {

            var parentWorldBoxRect = this._element.parentNode.worldContentBox[ axis.get ]( );

            this._rect[ axis.a ] += parentWorldBoxRect[ axis.a ];
            this._rect[ axis.b ] += parentWorldBoxRect[ axis.b ];

        }

    }

}
