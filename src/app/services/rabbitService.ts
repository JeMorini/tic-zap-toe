import { connectToRabbitMQ } from "../configs/rabbitMQ";

export async function publishToQueue(queueName: string, message: Buffer) {
  const { channel } = await connectToRabbitMQ();

  if (channel) {
    channel.sendToQueue(queueName, message, {
      persistent: true,
    });
  }

  console.log("Mensagem adicionada à fila:", message);
}
