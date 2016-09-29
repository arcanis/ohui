export class Event {

    constructor(name, properties) {

        this.name = name;
        this.cancelable = true;

        for (let propertyName of properties)
            this[propertyName] = properties[propertyName];

        var defaultAction = null;
        var isDefaultPrevented = false;
        var isDefaultCancelable = this.cancelable;

        this.isDefaultPrevented = () => {

            return isDefaultPrevented;

        };

        this.preventDefault = () => {

            if (!isDefaultCancelable)
                return;

            isDefaultPrevented = true;

        };

        this.setDefault = action => {

            if (!isFunction(typeof action))
                throw new Error(`Invalid default`);

            defaultAction = defaultAction || action;

        };

        this.resolveDefault = () => {

            if (isDefaultPrevented || !defaultAction)
                return;

            defaultAction(this);

        };

    }

}
