import { IEmail } from './email';
export interface IStore {
    set(name: string, email: IEmail): Promise<IEmail>;
    get(name: string): Promise<IEmail>;
}
export declare class EmailStore implements IStore {
    private model;
    constructor(db: any, options: any);
    set(name: any, options: any): Promise<IEmail>;
    get(name: any): Promise<IEmail>;
}
