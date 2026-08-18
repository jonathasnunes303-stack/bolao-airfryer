"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const PIX = "jonathasn852@gmail.com";
const MINIMO = 5;

export default function Home() {
  const [palpites, setPalpites] = useState([]);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [valor, setValor] = useState("5");
  const [palpite, setPalpite] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function carregarPalpites() {
    const { data, error } = await supabase
      .from("palpites")
      .select("id,nome,whatsapp,palpite,valor,pagamento,criado_em")
      .order("criado_em", { ascending: false });

    if (!error) {
      setPalpites(data || []);
    }
  }

  useEffect(() => {
    carregarPalpites();
  }, []);

  const premio = useMemo(() => {
    return palpites
      .filter((p) => p.pagamento === true)
      .reduce((total, p) => total + Number(p.valor || 0), 0);
  }, [palpites]);

  async function enviarPalpite(event) {
    event.preventDefault();
    setMensagem("");

    const valorNumerico = Number(String(valor).replace(",", "."));

    if (!nome.trim()) {
      setMensagem("Digite seu nome.");
      return;
    }

    if (!palpite.trim()) {
      setMensagem("Digite seu palpite.");
      return;
    }

    if (!Number.isFinite(valorNumerico) || valorNumerico < MINIMO) {
      setMensagem("O valor mínimo é R$ 5,00.");
      return;
    }

    setEnviando(true);

    const { error } = await supabase.from("palpites").insert({
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      valor: valorNumerico,
      palpite: palpite.trim(),
      pagamento: false
    });

    setEnviando(false);

    if (error) {
      setMensagem("Erro ao enviar o palpite. Tente novamente.");
      return;
    }

    setNome("");
    setWhatsapp("");
    setValor("5");
    setPalpite("");

    setMensagem(
      "Palpite enviado! Agora faça o Pix e envie o comprovante."
    );

    carregarPalpites();
  }

  function copiarPix() {
    navigator.clipboard.writeText(PIX);
    setMensagem("Chave Pix copiada! 👍");
  }

  function dinheiro(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  return (
    <main style={styles.body}>
      <div style={styles.container}>

        <section style={styles.hero}>
          <div style={styles.emoji}>🍳</div>

          <div style={styles.tag}>BOLÃO</div>

          <h1 style={styles.title}>
            Quanto tempo a Airfryer vai ficar suja?
          </h1>

          <p style={styles.subtitle}>
            Dê seu palpite e tente chegar mais perto do tempo real.
          </p>

          <div style={styles.premio}>
            <span>🏆 PRÊMIO ATUAL</span>
            <strong>{dinheiro(premio)}</strong>
            <small>100% dos valores confirmados</small>
          </div>
        </section>

        <section style={styles.card}>
          <h2>💸 Como participar</h2>

          <p>
            Escolha quanto quer colocar no bolão.
            O valor mínimo é <strong>R$ 5,00</strong>.
          </p>

          <div style={styles.pixBox}>
            <div>
              <small>CHAVE PIX</small>
              <strong>{PIX}</strong>
            </div>

            <button onClick={copiarPix} style={styles.secondaryButton}>
              Copiar Pix
            </button>
          </div>
        </section>

        <section style={styles.card}>
          <h2>⏱️ Faça seu palpite</h2>

          <form onSubmit={enviarPalpite}>

            <label style={styles.label}>
              Nome
              <input
                style={styles.input}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
              />
            </label>

            <label style={styles.label}>
              WhatsApp
              <input
                style={styles.input}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(86) 99999-9999"
              />
            </label>

            <label style={styles.label}>
              Quanto você quer colocar?
              <input
                style={styles.input}
                type="number"
                min="5"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </label>

            <label style={styles.label}>
              Seu palpite
              <input
                style={styles.input}
                value={palpite}
                onChange={(e) => setPalpite(e.target.value)}
                placeholder="Ex.: 2 dias e 6 horas"
              />
            </label>

            <button
              type="submit"
              disabled={enviando}
              style={styles.primaryButton}
            >
              {enviando ? "Enviando..." : "ENVIAR MEU PALPITE"}
            </button>

          </form>

          {mensagem && (
            <div style={styles.mensagem}>
              {mensagem}
            </div>
          )}
        </section>

        <section style={styles.card}>
          <div style={styles.listaCabecalho}>
            <div>
              <h2>📋 Palpites da galera</h2>
              <small>{palpites.length} participante(s)</small>
            </div>

            <button
              onClick={carregarPalpites}
              style={styles.secondaryButton}
            >
              Atualizar
            </button>
          </div>

          {palpites.length === 0 ? (
            <p style={styles.vazio}>
              Ainda não tem ninguém. Seja o primeiro! 😎
            </p>
          ) : (
            <div>
              {palpites.map((p) => (
                <div key={p.id} style={styles.palpite}>

                  <div>
                    <strong>{p.nome}</strong>
                    <div style={styles.palpiteTexto}>
                      ⏱️ {p.palpite}
                    </div>
                  </div>

                  <div style={styles.direita}>
                    <strong>{dinheiro(p.valor)}</strong>

                    <small>
                      {p.pagamento
                        ? "✅ confirmado"
                        : "⏳ aguardando Pix"}
                    </small>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

        <footer style={styles.footer}>
          Bolão entre amigos • Boa sorte! 🍀
        </footer>

      </div>
    </main>
  );
}

const styles = {
  body: {
    minHeight: "100vh",
    background: "#f3efe8",
    color: "#222",
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: "20px"
  },

  container: {
    maxWidth: "680px",
    margin: "auto"
  },

  hero: {
    background: "#fff",
    borderRadius: "24px",
    padding: "32px 22px",
    textAlign: "center",
    marginBottom: "15px",
    boxShadow: "0 8px 30px rgba(0,0,0,.08)"
  },

  emoji: {
    fontSize: "55px"
  },

  tag: {
    fontSize: "12px",
    fontWeight: "bold",
    letterSpacing: "3px",
    color: "#777",
    marginTop: "8px"
  },

  title: {
    fontSize: "34px",
    lineHeight: "1.1",
    margin: "10px 0"
  },

  subtitle: {
    color: "#666",
    lineHeight: "1.5"
  },

  premio: {
    marginTop: "25px",
    background: "#171717",
    color: "#fff",
    borderRadius: "18px",
    padding: "20px"
  },

  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "22px",
    marginBottom: "15px",
    boxShadow: "0 5px 20px rgba(0,0,0,.06)"
  },

  pixBox: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    background: "#f2f2f2",
    padding: "13px",
    borderRadius: "14px",
    marginTop: "15px"
  },

  secondaryButton: {
    border: "0",
    borderRadius: "10px",
    padding: "11px 13px",
    fontWeight: "bold",
    cursor: "pointer"
  },

  label: {
    display: "block",
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: "14px"
  },

  input: {
    display: "block",
    width: "100%",
    padding: "14px",
    marginTop: "6px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    fontSize: "16px",
    boxSizing: "border-box"
  },

  primaryButton: {
    width: "100%",
    border: "0",
    borderRadius: "13px",
    padding: "15px",
    background: "#111",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer"
  },

  mensagem: {
    marginTop: "12px",
    background: "#f0f0f0",
    padding: "12px",
    borderRadius: "12px"
  },

  listaCabecalho: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  palpite: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    padding: "14px 0",
    borderTop: "1px solid #eee"
  },

  palpiteTexto: {
    color: "#666",
    marginTop: "4px"
  },

  direita: {
    textAlign: "right"
  },

  vazio: {
    textAlign: "center",
    color: "#888",
    padding: "20px"
  },

  footer: {
    textAlign: "center",
    color: "#888",
    fontSize: "12px",
    padding: "10px"
  }
};
