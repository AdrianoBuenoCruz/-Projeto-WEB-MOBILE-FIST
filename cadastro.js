const config = {
    locateFile: filename =>
        `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${filename}`
};

let meuBanco;

async function carregarOuCriarBanco() {
    const SQL = await initSqlJs(config);
    const bancoSalvo = localStorage.getItem("meu_pwa_db");
    let db;

    if (bancoSalvo) {
        const u8 = new Uint8Array(JSON.parse(bancoSalvo));
        db = new SQL.Database(u8);
        console.log("Banco restaurado");
    } else {
        db = new SQL.Database();
    }

    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            telefone TEXT NOT NULL,
            cpf TEXT,
            endereco TEXT NOT NULL,
            senha TEXT NOT NULL,
            tipo_usuario TEXT NOT NULL,
            observacoes TEXT
        );
    `);

    salvarBanco(db);
    return db;
}

function salvarBanco(db) {
    const dadosBinarios = db.export();
    const arrayParaSalvar = Array.from(dadosBinarios);
    localStorage.setItem("meu_pwa_db", JSON.stringify(arrayParaSalvar));
}

window.onload = async function () {
    meuBanco = await carregarOuCriarBanco();

    const formulario = document.querySelector("form");

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const telefone = document.getElementById("telefone").value.trim();
        const cpf = document.getElementById("cpf").value.trim();
        const endereco = document.getElementById("endereco").value.trim();
        const senha = document.getElementById("senha").value.trim();
        const confirmarSenha = document.getElementById("confirmarSenha").value.trim();
        const tipoUsuario = document.getElementById("tipoUsuario").value;
        const observacoes = document.getElementById("observacoes").value.trim();

        if (senha !== confirmarSenha) {
            alert("As senhas não conferem.");
            return;
        }

        const usuarioExistente = meuBanco.exec(
            "SELECT * FROM usuarios WHERE email = ?",
            [email]
        );

        if (usuarioExistente.length > 0 && usuarioExistente[0].values.length > 0) {
            alert("Já existe um usuário cadastrado com esse e-mail.");
            return;
        }

        meuBanco.run(
            `INSERT INTO usuarios 
            (nome, email, telefone, cpf, endereco, senha, tipo_usuario, observacoes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [nome, email, telefone, cpf, endereco, senha, tipoUsuario, observacoes]
        );

        salvarBanco(meuBanco);

        alert("Cadastro realizado com sucesso!");

        formulario.reset();
    });
     alert("Cadastro realizado com sucesso!");
};