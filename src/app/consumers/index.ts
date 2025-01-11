import { firstMessage } from "./firstMessage";
import { challengedContact } from "./challengedContact";

const consumers = [firstMessage, challengedContact];

export async function startConsumers(channel: any, sock: any) {
  consumers.map((consumer) => {
    try {
      consumer(channel, sock);
      console.log(`Consumer ${consumer.name} iniciado com sucesso.`);
    } catch (error) {
      console.error(`Erro ao iniciar o consumer ${consumer.name}:`, error);
    }
  });
}
