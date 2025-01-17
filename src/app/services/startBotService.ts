import {
  useMultiFileAuthState,
  makeWASocket,
  fetchLatestBaileysVersion,
  WASocket,
} from "@whiskeysockets/baileys";
import { connectToRabbitMQ } from "../configs/rabbitMQ";
import { ReceiveMessageService } from "./receiveMessageService";
import { startConsumers } from "../consumers/index";
import amqp from "amqplib";

export class BotService {
  private sock: WASocket | null = null;
  private channel: amqp.Channel | null = null;

  async start(): Promise<void> {
    try {
      const { version } = await fetchLatestBaileysVersion();
      const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

      const rabbitMQ = await connectToRabbitMQ();
      if (!rabbitMQ || !rabbitMQ.channel) {
        throw new Error("Falha ao conectar ao RabbitMQ");
      }
      this.channel = rabbitMQ.channel;

      this.sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true, // Exibe o QR Code no terminal para autenticação
      });

      this.registerEvents(this.sock, saveCreds);
      startConsumers(this.channel, this.sock);

      console.log("Bot iniciado com sucesso!");
    } catch (error) {
      console.error("Erro ao iniciar o bot:", error);
    }
  }

  private registerEvents(sock: WASocket, saveCreds: () => Promise<void>): void {
    // Salva as credenciais após autenticação
    sock.ev.on("creds.update", saveCreds);

    // Escuta novas mensagens e as processa
    sock.ev.on("messages.upsert", async ({ messages }: any) => {
      if (this.channel) {
        const receiveMessageService = new ReceiveMessageService();
        await receiveMessageService.processMessages(messages);
      } else {
        console.warn("Canal do RabbitMQ não inicializado.");
      }
    });

    // Atualizações de conexão
    sock.ev.on("connection.update", (update: any) => {
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== 401;
        if (shouldReconnect) {
          console.log("Tentando reconectar...");
          this.start();
        } else {
          console.error("Erro de autenticação. Escaneie o QR Code novamente.");
        }
      }
      console.log("Status da conexão: ", connection);
    });
  }
}
