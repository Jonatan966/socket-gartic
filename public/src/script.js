const pincel = {
    cor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    espessura: 5,
    ativo: false,
    movendo: false,
    pos: {x: 0, y:0},
    posAnterior: null
}

document.addEventListener("DOMContentLoaded", () => {
    const tela = document.querySelector("#tela");
    const contexto = tela.getContext('2d');
    const socket = io.connect();

    document.querySelector("#lblMudaCor").children[0].style.color = pincel.cor;
    document.querySelector('#btnMudaCor').value = pincel.cor;

    tela.width = 700;
    tela.height = 500;

    const desenharLinha = (linha) => {
        contexto.beginPath();
        contexto.moveTo(linha.posAnterior.x, linha.posAnterior.y);
        contexto.lineTo(linha.pos.x, linha.pos.y);
        contexto.strokeStyle = linha.cor;
        contexto.lineJoin = "round";
        contexto.lineWidth = linha.espessura; 
        contexto.stroke();    
    }

    tela.onmousedown = (e) => {
        pincel.ativo = true;
    };
    tela.onmouseup = (e) => {
        pincel.ativo = false;
        if (pincel.movendo)
            socket.emit('desenho');

        pincel.movendo = false;
    };
    tela.onmousemove = (e) => {
        pincel.pos.x = e.clientX - tela.getBoundingClientRect().x;
        pincel.pos.y = e.clientY - tela.getBoundingClientRect().y;
        if (pincel.ativo) 
            pincel.movendo = true;
    }

    socket.on('desenhar', (linha) => {
        desenharLinha(linha);
    });

    socket.on('limpar', () => {
        contexto.clearRect(0, 0, tela.width, tela.height);
        document.querySelector('#lblTracos').innerHTML = 0;
    });

    socket.on('atualizaContagem', (cont) => {
        document.querySelector("h1").innerHTML = `Há ${cont} pessoas desenhando`;
    });

    socket.on('desenhos', (qtde) => {
        document.querySelector('#lblTracos').innerHTML = qtde;
    });

    window.addEventListener("keypress", (k) => {
        if (k.charCode == 32) {
            socket.emit('limpar');
        }
    });

    const ciclo = () => {
        if (pincel.ativo && pincel.movendo && pincel.posAnterior) {
            socket.emit('desenhar', {
                pos: pincel.pos,
                posAnterior: pincel.posAnterior,
                cor: pincel.cor,
                espessura: pincel.espessura
            });
        }
        pincel.posAnterior = {...pincel.pos};

        setTimeout(ciclo, 10);
    };

    ciclo();
});

function mudaCor() {
    pincel.cor = event.target.value;
    document.querySelector("#lblMudaCor").children[0].style.color = pincel.cor;
}

function mudaEspessura() {
    pincel.espessura = document.querySelector("#btnEspessura").value;
    document.querySelector('#lblEspessura').innerHTML = pincel.espessura;
}