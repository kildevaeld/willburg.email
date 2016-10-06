export interface TemplateEngine {
    compile(text: string): (locals?: any) => string;
}
export interface IEmail {
    text?: string;
    html?: string;
    to?: string;
    subject?: string;
    from?: string;
    locals?: {
        [key: string]: any;
    };
    attachments?: any;
}
export interface Options extends IEmail {
    engine?: string | TemplateEngine;
}
export declare class Email {
    engine: TemplateEngine;
    private _html;
    text: string | ((local?: any) => string);
    private _opts;
    html: string | ((local?: any) => string);
    constructor(opts: Options);
    render(options?: IEmail): Promise<any>;
}
