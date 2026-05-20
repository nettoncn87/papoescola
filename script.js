// Configurações de moderação
var listaBloqueada = ["idiota", "lixo", "burro", "estupido", "vadio", "fake", "troll", "puto", "puta", "vagabundo", "vagabunda"];
var listaDePosts = [];

// Carregamento inicial
var memoriaLocal = localStorage.getItem('meu_mural_dados');
if (memoriaLocal) {
    listaDePosts = JSON.parse(memoriaLocal);
}

window.onload = function() {
    desenharPosts();
};

// Funções de verificação e segurança
function temPalavraRuim(texto) {
    var textoLimpo = texto.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    for (var i = 0; i < listaBloqueada.length; i++) {
        if (textoLimpo.indexOf(listaBloqueada[i]) !== -1) return true;
    }
    return false;
}

function limparCodigo(htmlSujo) {
    var suporte = document.createElement('div');
    suporte.innerHTML = htmlSujo;
    var scripts = suporte.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
        scripts[i].parentNode.removeChild(scripts[i]);
    }
    return suporte.innerHTML;
}

function mostrarAviso(msg) {
    var elemento = document.getElementById('avisoSucesso');
    elemento.innerText = msg;
    elemento.classList.add('show');
    setTimeout(function() { elemento.classList.remove('show'); }, 3000);
}

function calcularTempo(dataAntiga) {
    var segundos = Math.floor((Date.now() - dataAntiga) / 1000);
    if (segundos < 60) return "Agora mesmo";
    var minutos = Math.floor(segundos / 60);
    if (minutos < 60) return "Há " + minutos + " min";
    return new Date(dataAntiga).toLocaleDateString();
}

// Reseta o formulário
function limparFormulario() {
    document.getElementById('caixaTexto').innerHTML = "";
    document.getElementById('nomeAluno').value = "";
    document.getElementById('turmaAluno').value = "";
    document.getElementById('senhaProf').value = "";
    document.getElementById('numLetras').innerText = "0";
}

// Logica de curtida unica
function curtirPost(id) {
    var travaID = "ja_curtiu_" + id;
    if (localStorage.getItem(travaID)) {
        alert("Você já apoiou esta postagem! ❤️");
        return;
    }
    for (var i = 0; i < listaDePosts.length; i++) {
        if (listaDePosts[i].id == id) {
            listaDePosts[i].curtidas++;
            localStorage.setItem(travaID, "sim");
            break;
        }
    }
    localStorage.setItem('meu_mural_dados', JSON.stringify(listaDePosts));
    desenharPosts();
}

// Função para publicar
function publicarPost() {
    var inputTexto = document.getElementById('caixaTexto');
    var papel = document.getElementById('tipoUsuario').value;
    var n = document.getElementById('nomeAluno').value.trim();
    var t = document.getElementById('turmaAluno').value.trim();
    var s = document.getElementById('senhaProf').value;

    // Campos obrigatórios
    if (inputTexto.innerText.trim() === "") {
        alert("A mensagem é obrigatória!");
        return;
    }
    if (papel === "Aluno") {
        if (n === "" || t === "") {
            alert("Nome e Turma são obrigatórios para alunos!");
            return;
        }
    } else if (s !== "admin") {
        alert("Senha de professor incorreta.");
        return;
    }

    if (temPalavraRuim(inputTexto.innerText)) {
        alert("Use termos adequados no ambiente escolar.");
        return;
    }

    var novoObj = {
        id: Date.now(),
        dataCriacao: Date.now(),
        autor: papel === "Aluno" ? n + " (" + t + ")" : "Professor(a) 🎓",
        conteudo: limparCodigo(inputTexto.innerHTML),
        curtidas: 0,
        comentariosProf: []
    };

    listaDePosts.unshift(novoObj);
    localStorage.setItem('meu_mural_dados', JSON.stringify(listaDePosts));
    limparFormulario();
    desenharPosts();
    mostrarAviso("Postagem publicada!");
}

function desenharPosts() {
    var container = document.getElementById('listaPostagens');
    container.innerHTML = "";
    for (var i = 0; i < listaDePosts.length; i++) {
        var post = listaDePosts[i];
        var card = document.createElement('div');
        card.className = 'card';
        var jaCurtiu = localStorage.getItem("ja_curtiu_" + post.id);
        var corBotao = jaCurtiu ? "btn-like desabilitado" : "btn-like";
        var htmlRespostas = "";
        for (var j = 0; j < post.comentariosProf.length; j++) {
            htmlRespostas += `
                <div class="reply-item teacher-badge">
                    <div class="reply-header"><span class="badge">RESPOSTA</span> <strong>Professor(a):</strong></div>
                    <div class="reply-body">${post.comentariosProf[j]}</div>
                </div>`;
        }
        card.innerHTML = `
            <button class="btn-delete" onclick="abrirApagar(${post.id})">×</button>
            <strong>${post.autor}</strong><br>
            <small style="color:#718096">${calcularTempo(post.dataCriacao)}</small>
            <div style="margin-top:12px">${post.conteudo}</div>
            <div class="replies-container">${htmlRespostas}</div>
            <div class="card-footer">
                <button class="${corBotao}" onclick="curtirPost(${post.id})">❤️ ${post.curtidas}</button>
                <button class="btn-reply" onclick="abrirResposta(${post.id})">💬 Feedback</button>
            </div>
        `;
        container.appendChild(card);
    }
}

// Modais e Suporte
var idFoco = null;
function abrirApagar(id) { idFoco = id; document.getElementById('janelaApagar').style.display = 'flex'; }
function abrirResposta(id) { idFoco = id; document.getElementById('janelaResposta').style.display = 'flex'; }
function fecharModais() { 
    document.getElementById('janelaApagar').style.display = 'none'; 
    document.getElementById('janelaResposta').style.display = 'none'; 
}
function confirmarExcluir() {
    if (document.getElementById('senhaAdminApagar').value === "admin") {
        listaDePosts = listaDePosts.filter(function(p) { return p.id !== idFoco; });
        localStorage.setItem('meu_mural_dados', JSON.stringify(listaDePosts));
        desenharPosts();
        fecharModais();
        document.getElementById('senhaAdminApagar').value = "";
    } else { alert("Senha incorreta."); }
}
function confirmarEnviarResposta() {
    var s = document.getElementById('senhaValidar').value;
    var t = document.getElementById('textoResposta').innerHTML;
    if (s === "admin" && t.trim() !== "") {
        for (var i = 0; i < listaDePosts.length; i++) {
            if (listaDePosts[i].id == idFoco) {
                listaDePosts[i].comentariosProf.push(limparCodigo(t));
                break;
            }
        }
        localStorage.setItem('meu_mural_dados', JSON.stringify(listaDePosts));
        desenharPosts();
        fecharModais();
        document.getElementById('textoResposta').innerHTML = "";
    } else { alert("Verifique os dados."); }
}
function formatarEstilo(cmd) { document.execCommand(cmd, false, null); }
function contar(caixa, contador) {
    document.getElementById(contador).innerText = document.getElementById(caixa).innerText.length;
}
function mudarTipo() {
    var tipo = document.getElementById('tipoUsuario').value;
    document.getElementById('camposAluno').style.display = (tipo === "Aluno") ? "flex" : "none";
    document.getElementById('checarSenhaProf').style.display = (tipo === "Professor") ? "block" : "none";
}
function usarAtalho(frase) { document.getElementById('textoResposta').innerHTML = frase; }
function toggleEmojis(id) {
    var e = document.getElementById(id);
    e.style.display = e.style.display === 'none' ? 'flex' : 'none';
}
function addEmoji(emoji, local) {
    document.getElementById(local).focus();
    document.execCommand('insertHTML', false, emoji);
}