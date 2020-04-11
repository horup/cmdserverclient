
/** A function which processes a command C, on a state S.
 *  Push can be called to send new commands.
 *  If transmit is true, the commands are also transmitted.
 *  A Handler can also access the Context of type O. 
 */
export type Handler<S,C,O=any> = (s:S, c:C, push?:(c:C, transmit:boolean)=>void, origin?:string, context?:O) => void;

export function process<S,C,O=any>(handlers:Handler<S,C,O>[], s:S, c:C, push:(c:C, transmit:boolean)=>any, origin?:string, context?:O)
{
    let produced:{c:C, transmit:boolean}[] = [];
    handlers.forEach(handler =>
    {
        let res = handler(s, c, (c, transmit)=>
        {
            produced.push({c:c, transmit:transmit});
        }, origin, context);
    });

    while (produced.length > 0)
    {
        let c = produced.pop();
        push(c.c, c.transmit);
    }
}