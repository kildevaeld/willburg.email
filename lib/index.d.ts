import { IEmail } from './email';
import { Sequelize } from 'willburg.sequelize';
export declare class EmailOptions {
    transport: any;
    store: any;
    catchall: string;
    extend(o: any): void;
}
export interface Response {
    payload: IEmail;
    response: any;
}
export declare class EmailService {
    private options;
    private store;
    private transport;
    constructor(options: EmailOptions, db: Sequelize);
    setEmail(name: string, email: IEmail): Promise<IEmail>;
    getEmail(name: string): Promise<IEmail>;
    send(name: string, email: IEmail): Promise<Response>;
    sendEmail(email: IEmail): Promise<void>;
    private _send(email);
}
