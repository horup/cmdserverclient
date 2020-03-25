export interface Monster
{
    readonly x:number;
    readonly y:number;
    readonly health:number;
}
export interface State
{
    monsters:{readonly [id:string]:Readonly<Monster>};
    round:number;
}

export interface Command
{
    /** a new round has started */
    newRound?:{round:number};

    /** Someone said something */
    chat?:{from:string, msg:string};

    /** A tick occured */
    tick?:{};

    /** Set monsters */
    setMonsters?:{[id:number]:Monster}};
}

export interface ClientCommand
{
    /** Say something */
    chat?:{msg:string};
}
