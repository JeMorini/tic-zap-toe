import { sendMessageService } from "../services/sendMessageService.js";

const QUEUE_NAME = "firstMessage";

export async function firstMessage(channel, sock) {
  channel.consume(
    QUEUE_NAME,
    async (msg) => {
      if (msg) {
        console.log("Mensagem recebida:", msg.content.toString());
        // Enviar a mensagem (aqui você pode chamar o método de envio de mensagens)
        sendMessageService(msg, channel, sock);
      }
    },
    { noAck: false }
  );

  console.log(`Agora escutando a fila: ${QUEUE_NAME}`);
}
