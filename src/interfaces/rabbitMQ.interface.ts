import { Connection, Channel } from "amqplib";

export interface RabbitMQConnection {
  connection?: Connection;
  channel?: Channel;
}
