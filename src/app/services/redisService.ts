import { connectionRedis } from "../configs/redis";

export class CacheService {
  private client: any;

  constructor() {}

  private async init(): Promise<void> {
    if (!this.client) {
      this.client = await connectionRedis();
    }
  }

  public async createOrUpdateCache(key: string, value: object): Promise<void> {
    await this.init();
    try {
      await this.client.set(key, JSON.stringify(value));
      console.log(`Cache criado: { key: "${key}", value: "${value}" }`);
    } catch (error) {
      console.error("Erro ao criar cache:", error);
    }
  }

  public async getCache(key: string): Promise<string | null> {
    await this.init();
    try {
      const result = await this.client.get(key);
      console.log(`Cache recuperado: { key: "${key}", value: "${result}" }`);
      return result;
    } catch (error) {
      console.error("Erro ao obter cache:", error);
      return null;
    }
  }

  public async findKeyContainingString(substring: string) {
    await this.init();
    const pattern = "*";
    let cursor = "0";
    let foundKey = null;

    console.log(substring);

    const result = await this.client.scan(cursor, "MATCH", pattern);

    console.log(result.keys);

    do {
      foundKey = result.keys.find((key: any) => key.includes(substring));
      if (foundKey) break;
    } while (cursor !== "0");

    return foundKey || null;
  }

  public async deleteCache(key: string): Promise<boolean> {
    await this.init();
    try {
      const result = await this.client.del(key);
      if (result === 1) {
        console.log(`Cache deletado: { key: "${key}" }`);
        return true;
      } else {
        console.log(`Chave não encontrada: { key: "${key}" }`);
        return false;
      }
    } catch (error) {
      console.error("Erro ao deletar cache:", error);
      return false;
    }
  }
}
