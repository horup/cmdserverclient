import * as http from 'http';
import {server} from './server';
import {client} from './client';

const httpServer = new http.Server();
server.attach(httpServer);
httpServer.listen(8080, "0.0.0.0");
client.connect("http://localhost:8080");

setInterval(()=>
{
    console.log(client.id);
}, 1000);
