import { connectionRedis } from "../configs/redis";

export class CacheService {
  private client: any;

  constructor() {}

  // Inicializa a conexão com o Redis
  private async init(): Promise<void> {
    if (!this.client) {
      this.client = await connectionRedis();
    }
  }

  // Cria ou atualiza um valor no cache
  public async createCache(key: string, value: object): Promise<void> {
    await this.init();
    try {
      console.log(`CHEGOU`, value);
      await this.client.set(key, JSON.stringify(value));
      console.log(`Cache criado: { key: "${key}", value: "${value}" }`);
    } catch (error) {
      console.error("Erro ao criar cache:", error);
    }
  }

  // Obtém um valor do cache
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
    const pattern = "*"; // Padrão para buscar todas as chaves
    let cursor = "0";
    let foundKey = null;

    console.log(substring);

    const result = await this.client.scan(cursor, "MATCH", pattern);

    console.log(result.keys);

    do {
      // Use o SCAN para buscar as chaves
      // const result = await this.client.scan(cursor, "MATCH", pattern);
      // console.log(result);
      // // Verifique se alguma chave contém a substring
      foundKey = result.keys.find((key: any) => key.includes(substring));
      if (foundKey) break;
      // cursor = nextCursor; // Atualize o cursor
    } while (cursor !== "0"); // Continua até voltar ao início

    return foundKey || null;
  }
}
