
import * as _ from 'lodash';
import * as Debug from 'debug';

const debug = Debug('livejazz:email');
const juice = require('juice');

export interface TemplateEngine {
    compile(text: string): (locals?: any) => string;
}

export interface IEmail {
    text?: string;
    html?: string;
    to?: string;
    subject?: string;
    from?: string;
    locals?: { [key: string]: any };
    attachments?: any
}

export interface Options extends IEmail {
    engine?: string | TemplateEngine;
}

export class Email {
    engine: TemplateEngine;
    private _html: string | ((local?: any) => string);
    public text: string | ((local?: any) => string);
    private _opts: Options;
    get html() {
        return this._html;
    }
    set html(html) {

        this._html = html;
    }

    constructor(opts: Options) {
        this._opts = opts = opts || {};
        this._html = null;
        this.text = null;

        if (this._opts.engine) {
            this.engine = require(<string>this._opts.engine);
        }

        if (opts.html)
            this.html = this.engine ? this.engine.compile(opts.html) : opts.html;

        if (opts.text)
            this.text = this.engine ? this.engine.compile(opts.text) : opts.text;
    }

    render(options?: IEmail): Promise<any> {
        options = options || {};

        let locals = options.locals || {};

        let ret: IEmail = _.pick(options, ["sender", "subject", "replyTo", "debug",
            "reply_to", "cc", "bcc", "body",
            "envelope", "inReplyTo", "references", "attachments", 'to', 'from']);
            
        _.extend(ret, _.omit(this._opts, ['engine']));

        
        debug('render email: %j', ret);
        if (this.text)
            ret.text = (typeof this.text === 'function') ? (<any>this.text)(locals) : this.text;

        if (this.html !== null) {
            let html = (typeof this.html === 'function') ? (<any>this).html(locals) : this.html;
            
            return new Promise((resolve, reject) => {
                juice.juiceResources(html, {}, function(err, results) {
                    if (err) return reject(err);
                    ret.html = results;
                    resolve(ret);
                });
            });
            
        } else {
            return Promise.resolve(ret);
        }
    }
    
    

}