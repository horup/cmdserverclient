import * as http from 'http';
import {Logger} from './logger';
import * as WebSocket from 'ws';
import {ClientMessage, ServerMessage} from './message';
import {v4 as uuid} from 'uuid';
import {Handler, process} from './handler';

interface WebSocketWithId extends WebSocket
{
    id:string;
}


export class Server<S, C, O=any>
{
    context:O = null;
    private logger:Logger;
    private state:S;
    private websocketServer:WebSocket.Server;
    handlers:Handler<S, C>[] = [];
    clientHandlers:Handler<S, C>[] = [];

    constructor(initialState:S,  logger:Logger = undefined)
    {
        this.state = initialState;
        this.logger = logger != null ? logger : {info:()=>{}};
    }

    onClientConnected:(id:string)=>void = ()=>{};
    onClientDisconnected:(id:string)=>void = ()=>{};

    attach(httpServer:http.Server)
    {
        this.websocketServer = new WebSocket.Server({noServer:true});
        this.websocketServer.on('connection', (conn:WebSocketWithId)=>
        {
            conn.id = uuid();
            this.logger.info(`Client connected with id: ${conn.id}`);
            conn.send(JSON.stringify({clientId:conn.id, s:this.state} as ServerMessage<S, C>));
            conn.on('message', (data)=>
            {
                let clientMsg = JSON.parse(data.toString()) as ClientMessage<C>;
                if (clientMsg.c != null)
                    this.pushClientCommand(clientMsg.c, conn.id);
            });
            conn.on('close', ()=>
            {
                this.logger.info(`Client disconected with id: ${conn.id}`);
                this.onClientDisconnected(conn.id);
            });

            this.onClientConnected(conn.id);
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

    pushCommand(c:C, transmit:boolean)
    {
        if (transmit)
        {
            this.websocketServer.clients.forEach((client:WebSocketWithId)=>
            {
                this.sendMessage(client, 
                {
                    c:c
                });
            });
        }

        process<S, C, O>(this.handlers, this.state, c, (c,t)=>this.pushCommand(c,t), null, this.context);
    }

    pushClientCommand(c:C, clientId:string)
    {
        process<S, C, O>(this.clientHandlers, this.state, c, (c,t)=>this.pushCommand(c,t), clientId, this.context);
    }

    sendMessage(client:WebSocketWithId, msg:ServerMessage<S, C>)
    {
        client.send(JSON.stringify(msg));
    }
}