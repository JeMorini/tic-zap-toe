import { publishToQueue } from "./rabbitService";
import { Messages } from "../../interfaces/messages.interface";
import { CacheService } from "./redisService";

export class ReceiveMessageService {
  private cacheService: CacheService;

  constructor() {
    this.cacheService = new CacheService();
  }

  public async processMessages(messages: Array<Messages>): Promise<void> {
    const message = messages[0];
    const messageType = Object.keys(message.message)[0];

    if (message.message && message.message.conversation) {
      await this.handleConversationMessage(message, messageType);
    } else if (messageType === "contactMessage") {
      await this.handleContactMessage(message);
    }
  }

  private async handleConversationMessage(
    message: Messages,
    messageType: string
  ): Promise<void> {
    const text = message.message.conversation;
    const sender = message.key.remoteJid;

    const cacheRegister = await this.cacheService.findKeyContainingString(
      sender
    );

    if (!cacheRegister) {
      console.log("Tipo de mensagem:", messageType);

      const challenger = sender;
      const type = "firstMessage";

      const msgToQueue = Buffer.from(
        JSON.stringify({ sender, text, challenger, type })
      );
      return publishToQueue(type, msgToQueue);
    }

    if (cacheRegister) {
      const cacheData = await this.cacheService.getCache(cacheRegister);
      const challenger = sender;

      if (cacheData) {
        const cache = JSON.parse(cacheData);
        this.validateMessage(
          cache.status,
          text || "",
          challenger,
          cacheRegister.challenged
        );
      }
    }
  }

  private async handleContactMessage(message: Messages): Promise<void> {
    const contact = message.message.contactMessage;
    console.log("Nome:", contact.displayName);

    const match = contact.vcard.match(/TEL.*:(\+?\d[\d\s\-.()]+)/);
    const phoneNumber = match
      ? match[1].replace(/[\s\-.()]/g, "").replace(/^\+/, "")
      : null;

    console.log("Número:", phoneNumber); // Extrai o número

    const challenger = message.key.remoteJid;
    const challenged = phoneNumber;
    const type = "challengedContact";

    const msgToQueue = Buffer.from(
      JSON.stringify({ challenger, challenged, type })
    );
    publishToQueue("challengedContact", msgToQueue);
  }

  private async validateMessage(
    status: string,
    message: string,
    challenger: string,
    challenged: string
  ): Promise<void> {
    let type = "incompatible";

    console.log(status);

    switch (status) {
      case "awaiting":
        if (message === "1") {
          type = "gameAccepted";
        } else if (message === "2") {
          type = "gameRefused";
        } else {
          type = "incompatible";
        }
        break;

      case "playing":
        break;

      default:
        type = "incompatible";
    }
    let msgToQueue = Buffer.from(
      JSON.stringify({ challenger, challenged, type })
    );

    publishToQueue(type, msgToQueue);
  }
}
