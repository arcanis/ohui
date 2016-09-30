import { isFunction } from 'lodash';

export class Event {

    constructor(name, properties = {}) {

        this.name = name;
        this.cancelable = true;

        for (let propertyName of Object.keys(properties))
            this[propertyName] = properties[propertyName];

        let defaultAction = null;
        let isDefaultPrevented = false;
        let isDefaultCancelable = this.cancelable;

        this.isDefaultPrevented = () => {

            return isDefaultPrevented;

        };

        this.preventDefault = () => {

            if (!isDefaultCancelable)
                return;

            isDefaultPrevented = true;

        };

        this.setDefault = action => {

            if (!isFunction(action))
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
