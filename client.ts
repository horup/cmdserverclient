import { Logger } from "./logger";
import * as WebSocket from 'isomorphic-ws';
import { ClientMessage, ServerMessage } from "./message";
import {Handler, process} from './handler';

/** Where S is the state and C is the command */
export class Client<S, C>
{
    id:string;
    state:S;
    logger:Logger;
    websocket:WebSocket;
    handlers:Handler<S, C>[] = [];
    constructor(logger:Logger)
    {
        this.logger = logger;
        if (this.logger == null)
        {
            this.logger = {info:()=>{}};
        }
    }

    async connect(url:string)
    {
        return new Promise<boolean>((resolve, reject)=>
        {
            this.websocket = new WebSocket(url);

            this.websocket.onopen = (e)=>
            {
                this.logger.info(`Connected to ${url}`);
                resolve(true);
            }
            this.websocket.onmessage = (e)=>
            {
                this.logger.info(`Msg recv ${e.data}`);
                let msg = JSON.parse(e.data as any) as ServerMessage<S, C>;
                if (msg.c)
                    this.pushCommand(msg.c, false);
                if (msg.s)
                    this.state = msg.s;
                if (msg.clientId)
                    this.id = msg.clientId;
               
            }
            this.websocket.onclose = ()=>
            {
                this.logger.info(`Closed`);
            }

            this.websocket.onerror = (e)=>
            {
                resolve(false);
            }

        });
    }

    /** Push a command to the client. 
     *  This command is processed by zero or more handlers.
     *  If transmit is true, the command is also transmitted to the server for processing. */
    private pushCommand(c:C, transmit:boolean)
    {
        if (transmit)
        {
            this.websocket.send(JSON.stringify({c:c} as ClientMessage<C>));
        }

        process<S, C>(this.handlers, this.state, c, (c,t)=>this.pushCommand(c,t));
    }
}