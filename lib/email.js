"use strict";
const _ = require('lodash');
const Debug = require('debug');
const debug = Debug('livejazz:email');
const juice = require('juice');
class Email {
    constructor(opts) {
        this._opts = opts = opts || {};
        this._html = null;
        this.text = null;
        if (this._opts.engine) {
            this.engine = require(this._opts.engine);
        }
        if (opts.html)
            this.html = this.engine ? this.engine.compile(opts.html) : opts.html;
        if (opts.text)
            this.text = this.engine ? this.engine.compile(opts.text) : opts.text;
    }
    get html() {
        return this._html;
    }
    set html(html) {
        this._html = html;
    }
    render(options) {
        options = options || {};
        let locals = options.locals || {};
        let ret = _.pick(options, ["sender", "subject", "replyTo", "debug",
            "reply_to", "cc", "bcc", "body",
            "envelope", "inReplyTo", "references", "attachments", 'to', 'from']);
        _.extend(ret, _.omit(this._opts, ['engine']));
        debug('render email: %j', ret);
        if (this.text)
            ret.text = (typeof this.text === 'function') ? this.text(locals) : this.text;
        if (this.html !== null) {
            let html = (typeof this.html === 'function') ? this.html(locals) : this.html;
            return new Promise((resolve, reject) => {
                juice.juiceResources(html, {}, function (err, results) {
                    if (err)
                        return reject(err);
                    ret.html = results;
                    resolve(ret);
                });
            });
        }
        else {
            return Promise.resolve(ret);
        }
    }
}
exports.Email = Email;
