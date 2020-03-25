import {Server} from '../server';
import {Client} from '../client';
import {Logger} from '../logger';
import * as http from 'http';

const serverLogger:Logger = 
{
    info:(s:string)=>console.log("SERVER> "+ s)
}

const clientLogger:Logger = 
{
    info:(s:string)=>console.log("CLIENT> "+ s)
}

interface State
{
    round:number;
}

interface Command
{
    /** a new round has started */
    newRound?:{round:number};

    /** Someone said something */
    chat?:{from:string, msg:string};
}

interface ClientCommand
{
    /** Say something */
    chat?:{msg:string};
}

const server = new Server<State, Command, ClientCommand>({round:0}, 
    [
        
    ],
    [
        (s, cc)=>
        {
            if (cc != null && cc.chat != null)
            {
                return [{chat:{from:"unknown", msg:cc.chat.msg}}];
            }
        }
    ], serverLogger);


const httpServer = new http.Server();

server.attach(httpServer);
httpServer.listen(8080, "0.0.0.0");


const client = new Client<State, Command, ClientCommand>([
    (s, c)=>
    {
        if (c && c.chat)
        {
            clientLogger.info(c.chat.msg);
        }
    }
], clientLogger);


client.connect("http://localhost:8080").then(v=>
{
    if (v)
    {
        client.pushClientCommand({chat:{msg:"Hello world!"}});
    }
});

