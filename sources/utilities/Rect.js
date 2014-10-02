export class Rect {

    constructor( other ) {

        if ( other instanceof Rect ) {

            this.copySelf( other );

        } else {

            this.top = this.bottom = 0;
            this.left = this.right = 0;

            this.width = this.height = null;

        }

    }

    copySelf( other ) {

        this.left = other.left;
        this.right = other.right;

        this.top = other.top;
        this.bottom = other.bottom;

        this.width = other.width;
        this.height = other.height;

    }

    contractSelf( top, right, bottom, left ) {

        this.top += top;
        this.bottom += bottom;

        this.left += left;
        this.right += right;

        this.width -= left + right;
        this.height -= top + bottom;

        this.width = Math.max( 0, this.width );
        this.height = Math.max( 0, this.height );

    }

    setOriginSelf( top, right, bottom, left ) {

        this.top += top;
        this.bottom += bottom;

        this.left += left;
        this.right += right;

    }

    isValid( ) {

        return ! isNaN( this.width ) && ! isNaN( this.height );

    }

    contains( other ) {

        return other.left >= this.left
            && other.top >= this.top
            && other.left + other.width <= this.left + this.width
            && other.top + other.height <= this.top + this.height;

    }

    exclude( other ) {

        if ( ! this.width || ! this.height )
            return [ ];

        var intersection = this.intersection( other );

        if ( ! intersection )
            return [ new Rect( this ) ];

        var workingRect = new Rect( this );
        var results = [ ], tmp;

        if ( intersection.left > this.left ) {
            results.push( tmp = new Rect( ) );
            tmp.left = this.left;
            tmp.right = intersection.right + intersection.width;
            tmp.top = intersection.top;
            tmp.bottom = intersection.bottom;
            tmp.width = intersection.left - this.left;
            tmp.height = intersection.height;
        }

        if ( intersection.right > this.right ) {
            results.push( tmp = new Rect( ) );
            tmp.left = intersection.left + intersection.width;
            tmp.right = this.right;
            tmp.top = intersection.top;
            tmp.bottom = intersection.bottom;
            tmp.width = intersection.right - this.right;
            tmp.height = intersection.height;
        }

        if ( intersection.top > this.top ) {
            results.push( tmp = new Rect( ) );
            tmp.left = this.left;
            tmp.right = this.right;
            tmp.top = this.top;
            tmp.bottom = intersection.bottom + intersection.height;
            tmp.width = this.width;
            tmp.height = intersection.top - this.top;
        }

        if ( intersection.bottom > this.bottom ) {
            results.push( tmp = new Rect( ) );
            tmp.left = this.left;
            tmp.right = this.right;
            tmp.top = intersection.top + intersection.height;
            tmp.bottom = this.bottom;
            tmp.width = this.width;
            tmp.height = intersection.bottom - this.bottom;
        }

        return results;

    }

    intersection( other ) {

        var doesIntersect =

            other.left < this.left + this.width &&
            other.left + other.width > this.left &&

            other.top < this.top + this.height &&
            other.top + other.height > this.top &&

            this.width > 0 && this.height > 0 &&
            other.width > 0 && other.height > 0;

        if ( ! doesIntersect )
            return false;

        var rect = new Rect( );

        rect.left = Math.max( this.left, other.left );
        rect.top = Math.max( this.top, other.top );

        rect.width = Math.min( this.left + this.width, other.left + other.width ) - rect.left;
        rect.height = Math.min( this.top + this.height, other.top + other.height ) - rect.top;

        rect.right = Math.min( this.right + this.width, other.right + other.width ) - rect.width;
        rect.bottom = Math.min( this.bottom + this.height, other.bottom + other.height ) - rect.height;

        return rect;

    }


}
