
import {decorators} from 'willburg';
import {IEmail, Email} from './email';
import {IStore, EmailStore} from './store'
import * as Debug from 'debug';
import {Transporter, createTransport} from 'nodemailer';
import {Sequelize} from 'willburg.sequelize';
import * as _ from 'lodash';

const debug = Debug('livejazz:email');

export class EmailOptions {
    transport: any = {
        type: 'Pickup'
    };
    store: any = {
        type: 'file',
        path: './emails'
    };
    catchall: string;
    
    extend(o:any) {
        try {
            _.extend(this, o)
            //Object.assign(this, o);
        } catch (e) {
            console.log(e)
        }
    }
}

export interface Response {
    payload: IEmail;
    response: any;
}


@decorators.inject(EmailOptions, Sequelize)
@decorators.options(EmailOptions)
@decorators.service()
export class EmailService {
    private store: IStore;
    private transport: Transporter;
    constructor(private options: EmailOptions, db: Sequelize) {
        
        
        this.store = new EmailStore(db, options.store.options);
        let transport = function(o) { return o; };
        let type = options.transport.type.toLowerCase();

        if (type === 'pickup') {
            transport = require('nodemailer-pickup-transport');
        } else if (type === 'ses') {
            transport = require('nodemailer-ses-transport');
        } else if (type === 'sendgrid' || type === "sq") {
            transport = require('nodemailer-sendgrid-transport');
        } else if (type === 'smtp') {
            transport = require('nodemailer-smtp-transport');
        }

        debug('using transport: "%s", options: %j', type, options);
        this.transport = createTransport(transport(options.transport.options));   
    }

    setEmail(name: string, email: IEmail): Promise<IEmail> {
        return this.store.set(name, email);
    }

    getEmail(name: string): Promise<IEmail> {
        return this.store.get(name);
    }

    async send(name: string, email: IEmail): Promise<Response> {
        /* jshint eqnull:true */
        let e = await this.getEmail(name);
        

        if (e == null) {
            throw new Error('email ' + name + ' does not exist');
        }
        
        let em = new Email(e);

        let payload =  await em.render(email);

        let res = await this._send(payload);

        return {payload: payload, response:res};
    }

    sendEmail(email: IEmail): Promise<void> {
        let e = new Email(email);
        return e.render().then((result) => {
            return this._send(result);
        });
    }

    private _send(email: IEmail): Promise<any> {
        return new Promise((resolve, reject) => {

            if (this.options.catchall) {
                debug('using catchall address %s', this.options.catchall);
                email.to = this.options.catchall;
            }

            debug('send email: %j', email);
            this.transport.sendMail(email, function(err, response) {
                if (err) return reject(err);
                resolve(response);
            });

        });
    }

}