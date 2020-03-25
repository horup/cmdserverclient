import { Logger } from "../logger";
import { Client } from "../client";
import { State, Command, ClientCommand } from "./interfaces";
import { setter } from "./handlers";

const logger:Logger = 
{
    info:(s:string)=>console.log("CLIENT> "+ s)
}

export const client = new Client<State, Command, ClientCommand>([
    setter,
    (s, c)=>
    {
        if (c.tick)
        {
            console.clear();
            console.log(s);
        }
    }
], logger);
