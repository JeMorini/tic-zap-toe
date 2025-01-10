import { firstMessage } from "./firstMessage.js";
import { challengedContact } from "./challengedContact.js";

const consumers = [firstMessage, challengedContact];

export async function startConsumers(channel, sock) {
  consumers.map((consumer) => {
    try {
      consumer(channel, sock);
      console.log(`Consumer ${consumer.name} iniciado com sucesso.`);
    } catch (error) {
      console.error(`Erro ao iniciar o consumer ${consumer.name}:`, error);
    }
  });
}
