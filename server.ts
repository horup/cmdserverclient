import * as http from 'http';
import {Logger} from './logger';
import * as WebSocket from 'ws';
import {ClientMessage, ServerMessage} from './message';
import {v4 as uuid} from 'uuid';

interface WebSocketWithId extends WebSocket
{
    id:string;
}

export type CommandHandler<S, C> = (s:S, c:C)=>(C[] | void);
export type ClientCommandHandler<S, C, CC> = (s:S, cc:CC)=>(C[] | void);

export class Server<S, C, CC>
{
    private logger:Logger;
    private state:S;
    private websocketServer:WebSocket.Server;
    private commandHandlers:CommandHandler<S, C>[];
    private clientCommandHandlers:ClientCommandHandler<S, C, CC>[];

    constructor(initialState:S, commandHandlers:CommandHandler<S, C>[], clientCommandHandlers:ClientCommandHandler<S, C, CC>[], logger:Logger = undefined)
    {
        this.state = initialState;
        this.commandHandlers = commandHandlers;
        this.clientCommandHandlers = clientCommandHandlers;
        this.logger = logger != null ? logger : {info:()=>{}};
    }

    attach(httpServer:http.Server)
    {
        this.websocketServer = new WebSocket.Server({noServer:true});
        this.websocketServer.on('connection', (conn:WebSocketWithId)=>
        {
            conn.id = uuid();
            this.logger.info(`Client connected with id: ${conn.id}`);
            conn.send(JSON.stringify({s:this.state} as ServerMessage<S, C>));
            conn.on('message', (data)=>
            {
                let clientMsg = JSON.parse(data.toString()) as ClientMessage<CC>;
                if (clientMsg.cc != null)
                    this.pushClientCommand(clientMsg.cc);
            });
            conn.on('close', ()=>
            {
                this.logger.info(`Client disconected with id: ${conn}`);
            });
        });

        httpServer.on('upgrade', (req,socket, head)=>
        {
            this.websocketServer.handleUpgrade(req, socket, head, (ws)=>
            {
                this.websocketServer.emit('connection', ws, req);
            });
        });
        this.logger.info("Attached server to HTTP server");
    }

    sendMessage(client:WebSocketWithId, msg:ServerMessage<S, C>)
    {
        client.send(JSON.stringify(msg));
    }

    pushCommand(c:C, transmit:boolean = true)
    {
        if (transmit)
        {
            this.websocketServer.clients.forEach((client:WebSocketWithId) =>
            {
                this.sendMessage(client, {
                    c:c
                });
            });
        }

        let produced:C[] = [];
        this.commandHandlers.forEach(handler=>
        {
            let res = handler(this.state, c);
            if (res)
                res.forEach(c=>produced.push(c));
        });

        while (produced.length > 0)
        {
            let c = produced.pop();
            this.pushCommand(c);
        }
    }

    pushClientCommand(c?:CC)
    {
        let produced:C[] = [];
        this.clientCommandHandlers.forEach(handler=>
        {
            let res = handler(this.state, c);
            if (res)
                res.forEach(c=>produced.push(c));
        });

        while (produced.length > 0)
        {
            let c = produced.pop();
            this.pushCommand(c);
        }
    }
}