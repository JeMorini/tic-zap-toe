import { publishToQueue } from "./rabbitService";
import { Messages } from "../../interfaces/messages.interface";

export async function receiveMessageService(messages: Array<Messages>) {
  const message = messages[0];

  const messageType = Object.keys(message.message)[0];

  // Primeira mensagem
  if (message.message && message.message.conversation) {
    const text = message.message.conversation;
    const sender = message.key.remoteJid;

    console.log("Tipo de mensagem:", messageType);

    const challenger = sender;

    const type = "firstMessage";

    // Adiciona a mensagem e o remetente na fila do RabbitMQ
    const msgToQueue = Buffer.from(
      JSON.stringify({ sender, text, challenger, type })
    );
    publishToQueue("firstMessage", msgToQueue);
  }

  // Contato para o desafio
  if (messageType === "contactMessage") {
    const contact = message.message.contactMessage;
    console.log("Nome:", contact.displayName);
    const match = contact.vcard.match(/TEL.*:(\+?\d[\d\s\-().]+)/);
    const phoneNumber = match
      ? match[1].replace(/[\s\-().]/g, "").replace(/^\+/, "")
      : null;
    console.log("Número:", phoneNumber); // Extrai o número
    const challenger = message.key.remoteJid;
    const challenged = phoneNumber;
    const type = "challengedContact";
    const msgToQueue = Buffer.from(
      JSON.stringify({ challenger, challenged, type })
    );
    publishToQueue("challengedContact", msgToQueue);
  }
}
