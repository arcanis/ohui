export class Event {

    constructor( name, properties ) {

        this.cancelable = true;

        Object.keys( properties ).forEach( name => {
            this[ name ] = properties[ name ]; } );

        this.name = name;

        if ( this.cancelable ) {

            var isDefaultPrevented = false;

            this.isDefaultPrevented = ( ) => isDefaultPrevented;

            this.preventDefault = ( ) => {

                if ( ! properties.cancelable ) {
                    isDefaultPrevented = true;
                }

            };

        }

    }

}
