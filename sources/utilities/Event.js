export class Event {

    constructor( name, properties ) {

        this.cancelable = true;

        Object.keys( properties ).forEach( name => {
            this[ name ] = properties[ name ]; } );

        this.name = name;

        var defaultAction = null;
        var isDefaultPrevented = false;
        var isDefaultCancelable = this.cancelable;

        this.isDefaultPrevented = ( ) => {

            return isDefaultPrevented;

        };

        this.preventDefault = ( ) => {

            if ( ! isDefaultCancelable )
                return ;

            isDefaultPrevented = true;

        };

        this.setDefault = action => {

            if ( typeof action !== 'function' )
                throw new Error( 'Invalid default' );

            defaultAction = defaultAction || action;

        };

        this.resolveDefault = ( ) => {

            if ( isDefaultPrevented || ! defaultAction )
                return ;

            defaultAction( this );

        };

    }

}
