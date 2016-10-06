"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const willburg_1 = require('willburg');
const email_1 = require('./email');
const store_1 = require('./store');
const Debug = require('debug');
const nodemailer_1 = require('nodemailer');
const willburg_sequelize_1 = require('willburg.sequelize');
const _ = require('lodash');
const debug = Debug('livejazz:email');
class EmailOptions {
    constructor() {
        this.transport = {
            type: 'Pickup'
        };
        this.store = {
            type: 'file',
            path: './emails'
        };
    }
    extend(o) {
        try {
            _.extend(this, o);
        }
        catch (e) {
            console.log(e);
        }
    }
}
exports.EmailOptions = EmailOptions;
let EmailService = class EmailService {
    constructor(options, db) {
        this.options = options;
        this.store = new store_1.EmailStore(db, options.store.options);
        let transport = function (o) { return o; };
        let type = options.transport.type.toLowerCase();
        if (type === 'pickup') {
            transport = require('nodemailer-pickup-transport');
        }
        else if (type === 'ses') {
            transport = require('nodemailer-ses-transport');
        }
        else if (type === 'sendgrid' || type === "sq") {
            transport = require('nodemailer-sendgrid-transport');
        }
        else if (type === 'smtp') {
            transport = require('nodemailer-smtp-transport');
        }
        debug('using transport: "%s", options: %j', type, options);
        this.transport = nodemailer_1.createTransport(transport(options.transport.options));
    }
    setEmail(name, email) {
        return this.store.set(name, email);
    }
    getEmail(name) {
        return this.store.get(name);
    }
    send(name, email) {
        return __awaiter(this, void 0, void 0, function* () {
            /* jshint eqnull:true */
            let e = yield this.getEmail(name);
            if (e == null) {
                throw new Error('email ' + name + ' does not exist');
            }
            let em = new email_1.Email(e);
            let payload = yield em.render(email);
            let res = yield this._send(payload);
            return { payload: payload, response: res };
        });
    }
    sendEmail(email) {
        let e = new email_1.Email(email);
        return e.render().then((result) => {
            return this._send(result);
        });
    }
    _send(email) {
        return new Promise((resolve, reject) => {
            if (this.options.catchall) {
                debug('using catchall address %s', this.options.catchall);
                email.to = this.options.catchall;
            }
            debug('send email: %j', email);
            this.transport.sendMail(email, function (err, response) {
                if (err)
                    return reject(err);
                resolve(response);
            });
        });
    }
};
EmailService = __decorate([
    willburg_1.decorators.inject(EmailOptions, willburg_sequelize_1.Sequelize),
    willburg_1.decorators.options(EmailOptions),
    willburg_1.decorators.service(), 
    __metadata('design:paramtypes', [EmailOptions, willburg_sequelize_1.Sequelize])
], EmailService);
exports.EmailService = EmailService;
