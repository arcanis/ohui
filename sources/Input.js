import   extend       from 'extend';

import { Event }      from './utilities/Event';
import { Text }       from './Text';
import { ansiColors } from './constants';

export class Input extends Text {

    constructor( style ) {

        super( extend( true, {

            focusable : true,
            ch : '.',

            active : {
                color : {
                    bg : ansiColors.BLUE
                }
            }

        }, style ) );

        this._events[ 'input' ] = [ ];

        this._caretOffset = 0;
        this._innerValue = '';

        Object.defineProperty( this, 'value', {

            get : ( ) => this._innerValue,

            set : ( newValue ) => {

                this._innerValue = newValue;
                this._caretOffset = this._innerValue.length;

                this.setContent( this._innerValue );

            }

        } );

        this.addEventListener( 'data', e => {

            var data = e.data.replace( /(\r\n|\r|\n)/g, '' );

            if ( this._caretOffset !== this._innerValue.length ) {
                this._innerValue = this._innerValue.substr( 0, this._caretOffset ) + data + this._innerValue.substr( this._caretOffset );
            } else {
                this._innerValue += data;
            }

            this._caretOffset += data.length;
            this.setContent( this._innerValue );

        } );

        this.addShortcutListener( 'backspace', ( ) => {

            if ( this._caretOffset === 0 )
                return ;

            if ( this._caretOffset !== this._innerValue.length ) {
                this._innerValue = this._innerValue.substr( 0, this._caretOffset - 1 ) + this._innerValue.substr( this._caretOffset );
            } else {
                this._innerValue = this._innerValue.substr( 0, this._caretOffset - 1 );
            }

            this._caretOffset -= 1;
            this.setContent( this._innerValue );

        } );

    }

};
