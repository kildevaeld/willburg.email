"use strict";
class EmailStore {
    constructor(db, options) {
        this.model = db.model(options.model);
    }
    set(name, options) {
        let self = this;
        return this.get(name).then((email) => {
            if (email)
                return Promise.reject(new Error('email already exists'));
            options.name = name;
            return this.model.create(options);
        });
    }
    get(name) {
        return this.model.find({ where: { name: name } });
    }
}
exports.EmailStore = EmailStore;
;
