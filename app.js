
const express = require('express');
const app = express();
const socketIo = require('socket.io');
const http = require('http');

const server = http.createServer(app);

const io = socketIo.listen(server);

server.listen(3333, () => {
    console.log("Servidor aberto!");
});

app.use(express.static(__dirname + "/public"));

let historico = [];
let desenhos = 0;

io.on('connection', (socket /** Usuário */) => {
    console.log("Nova conexão");

    io.emit('atualizaContagem', io.eio.clientsCount);
    io.emit('desenhos', desenhos);

    historico.forEach(linha => {
        socket.emit('desenhar',linha);
    });

    socket.on('desenhar', (linha) => {
        historico.push(linha);
        io./** Todos os usuários */emit('desenhar', linha);
    });

    socket.on('limpar', () => {
        console.log("Solicitação de limpeza recebida");
        historico = [];
        desenhos = 0;
        io.emit('limpar');
    });

    socket.on('disconnect', () => {
        io.emit('atualizaContagem', io.eio.clientsCount);
    });

    socket.on('desenho', () => {
        desenhos++;
        io.emit('desenhos', desenhos);
    });
});