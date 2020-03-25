export interface ServerMessage<S, C>
{
    c?:C;
    s?:S;
}

export interface ClientMessage<CC>
{
    cc?:CC;
}