import amqp from "amqplib";
import dotenv from "dotenv";
import { RabbitMQConnection } from "../../interfaces/rabbitMQ.interface";

const queues = [
  "firstMessage",
  "challengedContact",
  "gameAccepted",
  "gameRefused",
  "incompatible",
];

dotenv.config();

export async function connectToRabbitMQ(): Promise<RabbitMQConnection> {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || "");
    const channel = await connection.createChannel();

    // Inicializa todas as filas do array
    for (const queue of queues) {
      await channel.assertQueue(queue, { durable: false });
      console.log(`Queue "${queue}" inicializada com sucesso.`);
    }

    return { connection, channel };
  } catch (error) {
    console.error("Erro ao conectar ao RabbitMQ:", error);
    throw new Error("Erro ao conectar ao RabbitMQ");
  }
}
