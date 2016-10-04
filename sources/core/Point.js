export class Point {

    static fromJS({ x, y } = {}) {

        let point = new this();

        if (!isNil(x))
            point.x = x;

        if (!isNil(y))
            point.y = y;

        return point;

    }

    constructor(other) {

        if (other instanceof Point) {

            this.copySelf(other);

        } else {

            this.x = this.y = 0;

        }

    }

    copySelf(other) {

        this.x = other.x;
        this.y = other.y;

        return this;

    }

    toString() {

        return `<Point#x: ${this.x} y: ${this.y}>`;

    }

}
