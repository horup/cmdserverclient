import { Logger } from "../logger";
import { State, Command, ClientCommand, Monster } from "./interfaces";
import { Server } from "../server";
import { setter } from "./handlers";

const logger:Logger = 
{
    info:(s:string)=>console.log("SERVER> "+ s)
}

let nextId = 0;
const spawner = (s:State, c:Command)=>
{
    if (c.tick)
    {
        let commands:Command[] = [];
        if (Object.keys(s.monsters).length < 2)
        {
            let id = nextId++
            let monster:Monster = {
                health:15, 
                x:Math.random()*100, 
                y:Math.random()*100
            };
            
            commands.push({
                setMonsters:{
                    [id]:monster
                }
            })
        }

        return commands;
    }
}

const cleaner = (s:State, c:Command)=>
{
    if (c.tick)
    {
        for (let id in s.monsters)
        {
            let m = s.monsters[id];
            if (m.health <= 0)
            {
               // return [{setMonster:{}}]
            }
        }
    }
}

const thinker = (s:State, c:Command)=>
{
    if (c.tick)
    {
        const changes:Command[] = [];
        for (let id in s.monsters)
        {
            let m = s.monsters[id];
            if (m.health > 0)
            {
                let x = m.x + Math.random() - 0.5;
                let y = m.y + Math.random() - 0.5;
                changes.push({
                    setMonsters:{[id]:{...m, ...{x:x, y:y}}}
                })
            }
        }

        return changes;
    }
}

const initialState:State = {
    monsters:{},
    round:0
}

export const server = new Server<State, Command, ClientCommand>(initialState, 
    [
        spawner, 
        setter,
        thinker
    ],
    [
        
    ], logger);

setInterval(()=>
{
    server.pushCommand({tick:{}});
}, 1000);