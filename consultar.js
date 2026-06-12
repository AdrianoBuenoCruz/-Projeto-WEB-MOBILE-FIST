const config = {
    locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${filename}`
};

let meuBanco;

async function carregarOuCriarBanco() {
    const SQL = await initSqlJs(config);
    const bancoSalvo = localStorage.getItem("meu_pwa_db");
    let db;

    if (bancoSalvo) {
        const u8 = new Uint8Array(JSON.parse(bancoSalvo));
        db = new SQL.Database(u8);
        console.log("Banco de doações restaurado");
    } else {
        db = new SQL.Database();

        db.run(`
            CREATE TABLE doacoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alimento TEXT NOT NULL,
                quantidade INTEGER NOT NULL,
                unidade TEXT NOT NULL,
                data_doacao TEXT NOT NULL,
                status TEXT NOT NULL
            );
        `);

        db.run(`
            INSERT INTO doacoes (alimento, quantidade, unidade, data_doacao, status)
            VALUES
            ('Alface', 20, 'Unidades', '15/06/2026', 'Disponível'),
            ('Tomate', 8, 'Kg', '16/06/2026', 'Disponível'),
            ('Cenoura', 5, 'Kg', '17/06/2026', 'Reservado');
        `);

        salvarBanco(db);
        console.log("Novo banco de doações criado");
    }

    return db;
}

function salvarBanco(db) {
    const dadosBinarios = db.export();
    const arrayParaSalvar = Array.from(dadosBinarios);
    localStorage.setItem("meu_pwa_db", JSON.stringify(arrayParaSalvar));
    console.log("Banco de doações salvo");
}

function listarDoacoes() {
    const corpoTabela = document.querySelector("tbody");

    if (!corpoTabela || !meuBanco) {
        return;
    }

    const resultado = meuBanco.exec("SELECT * FROM doacoes ORDER BY id DESC");

    corpoTabela.innerHTML = "";

    if (resultado.length === 0) {
        corpoTabela.innerHTML = `
            <tr>
                <td colspan="5">Nenhuma doação cadastrada.</td>
            </tr>
        `;
        return;
    }

    const valores = resultado[0].values;

    for (let i = 0; i < valores.length; i++) {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${valores[i][1]}</td>
            <td>${valores[i][2]}</td>
            <td>${valores[i][3]}</td>
            <td>${valores[i][4]}</td>
            <td>${valores[i][5]}</td>
        `;

        corpoTabela.appendChild(linha);
    }
}

window.onload = async function () {
    console.log("Iniciando consulta de doações...");

    try {
        meuBanco = await carregarOuCriarBanco();
        listarDoacoes();
    } catch (error) {
        console.error("Erro ao carregar o banco de dados:", error);
    }
};
 document.getElementById("salvarBtn").addEventListener("click", function (event) {
    event.preventDefault();
    salvarBanco(meuBanco);
});
document.getElementById("salvarBtn").addEventListener("click", function (event) {
    event.preventDefault();
    salvarBanco(meuBanco);
});

