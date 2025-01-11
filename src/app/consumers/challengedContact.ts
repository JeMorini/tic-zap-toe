import { sendMessageService } from "../services/sendMessageService";

const QUEUE_NAME = "challengedContact";

export async function challengedContact(channel: any, sock: any) {
  channel.consume(
    QUEUE_NAME,
    async (msg: any) => {
      if (msg) {
        console.log("Mensagem recebida:", msg.content.toString());
        // Enviar a mensagem (aqui você pode chamar o método de envio de mensagens)
        sendMessageService(msg, sock);
      }
    },
    { noAck: false }
  );

  console.log(`Agora escutando a fila: ${QUEUE_NAME}`);
}
