var tput = require( 'node-tput' );

export var TermString = function ( string ) {

    this._content = [ '' ];

    this.length = 0;

    if ( typeof string !== 'undefined' ) {
        this.push( string );
    }

};

TermString.prototype.push = function ( string, raw ) {

    if ( string == null )
        return this;

    if ( Array.isArray( string ) ) {

        string = tput.apply( null, string );
        raw = true;

    }

    if ( string instanceof TermString ) {

        this.length += string.length;

        if ( this._content.length % 2 === 1 ) {

            this._content[ this._content.length - 1 ] += string._content[ 0 ];
            this._content = this._content.concat( string._content.slice( 1 ) );

        } else {

            this._content = this._content.concat( string._content );

        }

    } else if ( string.length === 0 ) {

        // Do nothing.

    } else if ( raw ) {

        if ( this._content.length % 2 === 0 ) {

            this._content[ this._content.length - 1 ] += string;

        } else {

            this._content.push( string );

        }

    } else {

        if ( this._content.length % 2 === 1 ) {

            this._content[ this._content.length - 1 ] += string.toString( );
            this.length += string.length;

        } else {

            this._content.push( string.toString( ) );
            this.length += string.length;

        }

    }

    return this;

};

TermString.prototype.unshift = function ( string, raw ) {

    if ( typeof string == null )
        return this;

    if ( Array.isArray( string ) ) {

        string = tput.apply( null, string );
        raw = true;

    }

    if ( string instanceof TermString ) {

        this._content.length += string.length;

        if ( string._content.length % 2 === 1 ) {

            this._content[ 0 ] = string._content[ string._content.length - 1 ] + this._content[ 0 ];
            this._content = [ ].concat( string._content.slice( 0, string._content.length - 1 ), this._content );

        } else {

            this._content = [ ].concat( string._content, this._content );

        }

    } else if ( raw ) {

        this._content.unshift( string );

        this._content.unshift( '' );

    } else {

        this._content[ 0 ] = string + this._content[ 0 ];

    }

    return this;

};

TermString.prototype.substr = function ( offset, length ) {

    if ( typeof length === 'undefined' )
        length = this.length - offset;

    if ( offset + length > this.length )
        length = Math.max( 0, this.length - offset );

    var index = 0;

    while ( index + 2 < this._content.length && offset >= this._content[ index ].length ) {
        offset -= this._content[ index ].length;
        index += 2;
    }

    for ( var prefix = '', escapeCodeIndex = index - 1; escapeCodeIndex >= 0; escapeCodeIndex -= 2 )
        prefix = this._content[ escapeCodeIndex ] + prefix;

    var result = new TermString( );
    result.push( prefix, true );

    while ( index < this._content.length && length > 0 ) {

        result.push( this._content[ index - 1 ], true );
        result.push( this._content[ index ].substr( offset, length ) );

        length -= this._content[ index ].length - offset;
        offset = 0;
        index += 2;

    }

    return result;

};

TermString.prototype.split = function ( pattern ) {

    var last = new TermString( ), results = [ last ];

    var prefix = '';
    var match, offset, str;

    if ( ! ( pattern instanceof RegExp ) )
        throw new Error( 'TermString can only split on regexp' );

    var regex = pattern.global ? pattern : new RegExp( pattern.source, 'g' + [
        pattern.multiline ? 'm' : '',
        pattern.ignoreCase ? 'i' : ''
    ].join( '' ) );

    for ( var t = 0; t < this._content.length; t += 2 ) {

        var escapeCode = this._content[ t - 1 ] || '';

        last.push( escapeCode, true );
        prefix += escapeCode;

        str = this._content[ t ];
        offset = 0;

        while ( ( match = regex.exec( str ) ) ) {
            last.push( str.substr( offset, match.index - offset ) );
            offset = match.index + match[ 0 ].length;
            results.push( last = new TermString( ) );
            last.push( prefix, true );
        }

        last.push( this._content[ t ].substr( offset ) );

    }

    return results;

};

TermString.prototype.replace = function ( pattern, replacement, insideRaw ) {

    if ( typeof insideRaw === 'undefined' )
        insideRaw = false;

    var other = new TermString( this );

    for ( var t = insideRaw ? 1 : 0; t < other._content.length; t += 2 ) {

        var part = other._content[ t ];
        var replaced = part.replace( pattern, replacement );

        if ( part === replaced )
            continue ;

        if ( ! insideRaw ) {
            other.length -= part.length;
            other.length += replaced.length;
        }

        if ( ! pattern.global ) {
            break ;
        }

    }

    return other;

};

TermString.prototype.toString = function ( ) {

    return this._content.join( '' );

};
