import { createCache } from "./redisService";

export async function sendMessageService(msg: any, sock: any) {
  const { sender, text, challenger, challenged, type } = JSON.parse(
    msg.content.toString()
  );

  const sendMessage = async (number: string, message: string) => {
    const jid = number;

    try {
      await sock.sendMessage(jid, { text: message });
      createCache(`${challenger}&${challenged}`, `start`);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  if (type === "firstMessage") {
    console.log("Mensagem processada da fila:", { sender, text });

    await sendMessage(sender, `Envie o contato de quem gostaria de desafiar!`);
  } else if (type === "challengedContact") {
    console.log("Mensagem processada da fila:", { sender, text });

    await sendMessage(
      `${challenged}@s.whatsapp.net`,
      `${challenger} desafiou você para uma partida de jogo da velha, aceita?!`
    );
  } else {
    console.log("Mensagem processada da fila:", { sender, text });

    await sendMessage(sender, `Recebemos sua mensagem: "${text}"`);
  }
}
