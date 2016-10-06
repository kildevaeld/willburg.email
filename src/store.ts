import {IModelList, IModel} from 'willburg.sequelize';
import {IEmail} from './email';

interface EmailModel extends IEmail, IModel {}

export interface IStore {
    set(name: string, email: IEmail): Promise<IEmail>;
    get(name: string): Promise<IEmail>;
}


export class EmailStore implements IStore {
    private model: IModelList<EmailModel>
    constructor(db, options) {
        this.model = db.model(options.model);
    }

    set(name, options): Promise<IEmail> {
        let self = this;
        return this.get(name).then<IEmail>((email) => {
            if (email) return Promise.reject(new Error('email already exists'));
            options.name = name;
            return this.model.create(options);
        });
    }

    get(name): Promise<IEmail> {
        return this.model.find({ where: { name: name } });
    }

};
