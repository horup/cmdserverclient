import { State, Command } from "./shared";


export const setter = (s:State, c:Command)=>
{
    if (c.setMonsters)
    {
        s.monsters = {...s.monsters, ...c.setMonsters}; 
    }
}