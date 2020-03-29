import { Logger } from "../logger";
import { State, Command, Monster } from "./shared";
import { Server } from "../server";
import { setter } from "./handlers";
import { Handler } from "../handler";

const logger:Logger = 
{
    info:(s:string)=>console.log("SERVER> "+ s)
}


const initialState:State = {
    monsters:{},
    round:0
}

const chatter:Handler<State, Command> = (s,c, push, origin)=>
{
    if (c.chat)
    {
        console.log(c.chat.msg + " from " +  origin);
    }
}

export const server = new Server<State, Command>(initialState, logger);
server.clientHandlers = [
    chatter
]