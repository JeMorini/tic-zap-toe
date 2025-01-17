import { CacheService } from "./redisService";

export class MessageService {
  private sock: any;
  private channel: any;
  private msg: any;

  constructor(sock: any, channel: any, msg: any) {
    this.sock = sock;
    this.channel = channel;
    this.msg = msg;
  }

  private async sendMessage(
    number: string,
    message: string,
    type: string,
    challenger?: string | null,
    challenged?: string | null,
    status?: object
  ): Promise<void> {
    const jid = number;
    const cacheService = new CacheService();

    try {
      await this.sock.sendMessage(jid, { text: message });

      if (challenger && challenged) {
        cacheService.createCache(
          `${challenger}&${challenged}@s.whatsapp.net`,
          status || { status: null }
        );
      }
      this.channel.ack(type);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  }

  private async sendMultipleMessages(
    messages: Array<{ jid: string; message: string }>,
    type: string
  ): Promise<void> {
    const cacheService = new CacheService();

    console.log("CHEGOUUU");

    try {
      messages.forEach(
        async ({ jid, message }) =>
          await this.sock.sendMessage(jid, { text: message })
      );
      // await this.sock.sendMessage(jid, { text: message });
      this.channel.ack(type);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  }

  public async processMessage(): Promise<void> {
    const { sender, text, challenger, challenged, type } = JSON.parse(
      this.msg.content.toString()
    );

    const cacheService = new CacheService();
    const cacheData = await cacheService.getCache(
      `${challenged}@s.whatsapp.net&${challenged}@s.whatsapp.net`
    );
    let cache;
    console.log("AWUI", challenger);
    console.log("AWUI", challenged);

    if (cacheData) {
      cache = JSON.parse(cacheData || "");
    }
    console.log("AWUI", cache);

    switch (type) {
      case "firstMessage":
        await this.sendMessage(
          sender,
          `Envie o contato de quem gostaria de desafiar!`,
          type,
          null,
          null
        );
        break;

      case "challengedContact":
        await this.sendMessage(
          `${challenged}@s.whatsapp.net`,
          `${challenger} desafiou você para uma partida de jogo da velha, aceita?!
Digite 1 para ACEITAR ou 2 para RECUSAR!`,
          type,
          challenger,
          challenged,
          {
            status: "awaiting",
            currentPlayer: null,
            gameStatus: "",
            challenger,
            challenged: `${challenged}@s.whatsapp.net`,
          }
        );
        break;

      case "gameAccepted":
        await this.sendMultipleMessages(
          [
            {
              jid: challenger,
              message: `${cache.challenged} aceitou seu desafio! Vamos começar!`,
            },
            {
              jid: cache.challenged,
              message: `Legal! Iremos comunicar o ${challenger} e começaremos o jogo!`,
            },
          ],
          type
        );
        break;

      default:
        await this.sendMessage(
          sender,
          `Recebemos sua mensagem: "${text}"`,
          "firstMessage"
        );
    }
  }
}
