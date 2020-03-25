import { Logger } from "./logger";
import * as WebSocket from 'isomorphic-ws';
import { ClientMessage, ServerMessage } from "./message";
export type CommandHandler<S, C> = (s:S, c:C)=>void;

export class Client<S, C, CC>
{
    state:S;
    logger:Logger;
    websocket:WebSocket;
    commandHandlers:CommandHandler<S, C>[];
    constructor(commandHandlers:CommandHandler<S, C>[], logger:Logger)
    {
        this.commandHandlers = commandHandlers;
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
                if (msg.c != null)
                    this.pushCommand(msg.c);
               
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

    private pushCommand(c:C)
    {
        this.commandHandlers.forEach(handler=>
        {
            let res = handler(this.state, c);
        });
    }


    pushClientCommand(cc:CC)
    {
        this.websocket.send(JSON.stringify({cc:cc} as ClientMessage<CC>));
    }
}