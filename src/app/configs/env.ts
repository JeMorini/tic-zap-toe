import dotenv from "dotenv";

dotenv.config();

export const config = {
  rabbitMQ: process.env.RABBITMQ_URL || "amqp://localhost",
  botAuthPath: process.env.BOT_AUTH_PATH || "./auth_info",
};
