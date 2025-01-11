import {
  useMultiFileAuthState,
  makeWASocket,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import { connectToRabbitMQ } from "../configs/rabbitMQ";
import { receiveMessageService } from "./receiveMessageService";
import { startConsumers } from "../consumers/index";

export async function startBotService() {
  try {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

    const { channel } = await connectToRabbitMQ(); // Conecta ao RabbitMQ

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: true, // Exibe o QR Code no terminal para autenticação
    });

    sock.ev.on("creds.update", saveCreds); // Salva as credenciais após autenticação

    // Envia mensagens para a fila do RabbitMQ ao receber uma mensagem
    sock.ev.on("messages.upsert", async ({ messages }: any) => {
      receiveMessageService(messages);
    });

    sock.ev.on("connection.update", (update: any) => {
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== 401;
        if (shouldReconnect) {
          console.log("Tentando reconectar...");
          startBotService();
        } else {
          console.error("Erro de autenticação. Escaneie o QR Code novamente.");
        }
      }
      console.log("Status da conexão: ", connection);
    });

    startConsumers(channel, sock);
  } catch (error) {
    console.error("Erro ao iniciar o bot:", error);
  }
}
