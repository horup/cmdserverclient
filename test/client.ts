import { Logger } from "../logger";
import { Client } from "../client";
import { State, Command } from "./shared";
import { setter } from "./handlers";

const logger:Logger = 
{
    info:(s:string)=>console.log("CLIENT> "+ s)
}

export const client = new Client<State, Command>(logger);
client.handlers = [
    setter,
    (s, c)=>
    {
        if (c.tick)
        {
            console.log(s);
        }
    }
]
