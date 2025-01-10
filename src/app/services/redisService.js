import { connectionRedis } from "../configs/redis.js";

export async function createCache(key, value) {
  const client = await connectionRedis();
  console.log(client);
  client.set(key, value);
}

export async function getCache(key) {
  const client = await connectionRedis();
  const result = await client.get(key);

  return result;
}
