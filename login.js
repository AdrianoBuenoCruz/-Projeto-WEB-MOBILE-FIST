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
        console.log("Banco de dados restaurado");
    } else {
        db = new SQL.Database();

        db.run(`
            CREATE TABLE login (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                senha TEXT NOT NULL
            );
        `);

        db.run(`
            INSERT INTO login (email, senha)
            VALUES
            ('admin@horta.com', '123456');
        `);

        salvarBanco(db);

        console.log("Novo banco criado");
    }

    return db;
}

function salvarBanco(db) {
    const dadosBinarios = db.export();
    const arrayParaSalvar = Array.from(dadosBinarios);

    localStorage.setItem(
        "meu_pwa_db",
        JSON.stringify(arrayParaSalvar)
    );

    console.log("Banco salvo");
}

window.onload = async function () {

    try {
        meuBanco = await carregarOuCriarBanco();

        document
            .getElementById("loginForm")
            .addEventListener("submit", function (event) {

                event.preventDefault();

                const email = document
                    .getElementById("email")
                    .value
                    .trim();

                const senha = document
                    .getElementById("senha")
                    .value
                    .trim();

                const resultado = meuBanco.exec(
                    `SELECT * FROM login
                     WHERE email='${email}'
                     AND senha='${senha}'`
                );

                if (
                    resultado.length > 0 &&
                    resultado[0].values.length > 0
                ) {
                    alert("Login realizado com sucesso!");

                    window.location.href = "cadastro.html";
                } else {
                    alert("Email ou senha incorretos.");
                }
            });

    } catch (erro) {
        console.error("Erro ao carregar banco:", erro);
    }
};