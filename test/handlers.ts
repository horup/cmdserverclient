import { State, Command } from "./interfaces";


export const setter = (s:State, c:Command)=>
{
    if (c.setMonsters)
    {
        //s.monsters[c.setMonster.monster.id] = c.setMonster.monster;
        s.monsters = {...s.monsters, ...c.setMonsters}; 
    }
}