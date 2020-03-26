/** Message sent from the server to one or more clients */
export interface ServerMessage<S, C>
{
    /** Inform the client its unique client id */
    clientId?:string;

    /** Command of type C, if any */
    c?:C;

    /** State of type S, if any */
    s?:S;
}

/** Client message with a command C.
*/
export interface ClientMessage<C>
{
    c?:C;
}