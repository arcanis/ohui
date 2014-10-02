export var emacs = function ( element ) {

    element.addShortcutListener( 'C-a', e => {

        e.preventDefault( );

        element.setCaretTo( 0, null );

    }, { isDefaultAction : true } );

    element.addShortcutListener( 'C-e', e => {

        e.preventDefault( );

        element.setCaretTo( +Infinity, null );

    }, { isDefaultAction : true } );

    element.addShortcutListener( 'C-k', e => {

        e.preventDefault( );

        var caret = element.getCaret( );
        var line = element.value.split( /(\r\n|\r|\n)/g )[ caret.y ];

    } );

};
