import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

export async function connectionRedis() {
  const client = createClient({
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  return client;
}
