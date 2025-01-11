import { connectionRedis } from "../configs/redis";

export async function createCache(key: string, value: string) {
  const client = await connectionRedis();
  console.log(client);
  client.set(key, value);
}

export async function getCache(key: string) {
  const client = await connectionRedis();
  const result = await client.get(key);

  return result;
}
