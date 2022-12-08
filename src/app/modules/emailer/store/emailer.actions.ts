import { Message } from "../model/message";

export class SendMail {
    static readonly type = '[EMAILER] Send mail';
    constructor(public payload: {message: Message} ) {}
}