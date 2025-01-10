import amqp from "amqplib";
import dotenv from "dotenv";

const queues = ["firstMessage", "challengedContact"]; // Array com os nomes das filas

export async function connectToRabbitMQ() {
  try {
    // Substitua pela sua URL do CloudAMQP
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Inicializa todas as filas do array
    for (const queue of queues) {
      await channel.assertQueue(queue, { durable: false });
      console.log(`Queue "${queue}" inicializada com sucesso.`);
    }

    return { connection, channel };
  } catch (error) {
    console.error("Erro ao conectar ao RabbitMQ:", error);
  }
}
