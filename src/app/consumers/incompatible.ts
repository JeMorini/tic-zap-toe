import { MessageService } from "../services/sendMessageService";

const QUEUE_NAME = "incompatible";

export async function incompatible(channel: any, sock: any) {
  channel.consume(
    QUEUE_NAME,
    async (msg: any) => {
      if (msg) {
        console.log("Mensagem recebida:", msg.content.toString());
        const messageService = new MessageService(sock, channel, msg);
        messageService.processMessage();
      }
    },
    { noAck: false }
  );

  console.log(`Agora escutando a fila: ${QUEUE_NAME}`);
}
