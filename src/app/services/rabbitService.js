import { connectToRabbitMQ } from "../configs/rabbitMQ.js";

export async function publishToQueue(queueName, message) {
  const { channel } = await connectToRabbitMQ();

  channel.sendToQueue(queueName, message, {
    persistent: true,
  });

  console.log("Mensagem adicionada à fila:", message);
}
