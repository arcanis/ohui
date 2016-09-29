import { Box } from '../boxes/Box';

export class ClipBox extends Box {

    refreshSize( axis ) {

        var contextBoxRect = this._context[ axis.get ]( );
        var parentClipBoxRect = this._element.parentNode.clipContentBox[ axis.get ]( );

        var doesIntersect =
            contextBoxRect[ axis.a ] < parentClipBoxRect[ axis.a ] + parentClipBoxRect[ axis.size ] &&
            contextBoxRect[ axis.a ] + contextBoxRect[ axis.size ] > parentClipBoxRect[ axis.a ] &&
            contextBoxRect[ axis.size ] > 0 && parentClipBoxRect[ axis.size ] > 0;

        if ( ! doesIntersect ) {

            this._rect[ axis.size ] = NaN;

        } else {

            var a = Math.max( contextBoxRect[ axis.a ], parentClipBoxRect[ axis.a ] );

            this._rect[ axis.size ] = Math.min( contextBoxRect[ axis.a ] + contextBoxRect[ axis.size ], parentClipBoxRect[ axis.a ] + parentClipBoxRect[ axis.size ] ) - a;

        }

    }

    refreshPosition( axis ) {

        var contextBoxRect = this._context[ axis.get ]( );
        var parentClipBoxRect = this._element.parentNode.clipContentBox[ axis.get ]( );

        var doesIntersect =
            contextBoxRect[ axis.a ] < parentClipBoxRect[ axis.a ] + parentClipBoxRect[ axis.size ] &&
            contextBoxRect[ axis.a ] + contextBoxRect[ axis.size ] > parentClipBoxRect[ axis.a ] &&
            contextBoxRect[ axis.size ] > 0 && parentClipBoxRect[ axis.size ] > 0;

        if ( ! doesIntersect ) {

            this._rect[ axis.a ] = NaN;
            this._rect[ axis.b ] = NaN;

        } else {

            this._rect[ axis.a ] = Math.max( contextBoxRect[ axis.a ], parentClipBoxRect[ axis.a ] );
            this._rect[ axis.b ] = Math.max( contextBoxRect[ axis.b ], parentClipBoxRect[ axis.b ] );

        }

    }

}
