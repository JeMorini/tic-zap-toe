import { CacheService } from "./redisService";
import { TicTacToeImage } from "./ticTacToeService";

export class MessageService {
  private sock: any;
  private channel: any;
  private msg: any;
  private cacheService: CacheService;

  constructor(sock: any, channel: any, msg: any) {
    this.sock = sock;
    this.channel = channel;
    this.msg = msg;
    this.cacheService = new CacheService();
  }

  private async sendMessage(
    number: string,
    message: { text: string; image?: Buffer },
    type: string,
    challenger?: string | null,
    challenged?: string | null,
    status?: object
  ): Promise<void> {
    const jid = number;

    try {
      await this.sock.sendMessage(jid, message);

      if (challenger && challenged) {
        this.cacheService.createCache(
          `${challenger}&${challenged}@s.whatsapp.net`,
          status || { status: null }
        );
      }
      this.channel.ack(this.msg);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  }

  private async sendMultipleMessages(
    messages: Array<{
      jid: string;
      message: { text?: string; image?: Buffer; caption?: string };
    }>,
    type: string
  ): Promise<void> {
    try {
      console.log(messages);
      const delay = (ms: any) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      (async () => {
        await this.sock.sendMessage(messages[0].jid, messages[0].message);

        await delay(1000);

        await this.sock.sendMessage(messages[1].jid, messages[1].message);
      })();
      this.channel.ack(type);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  }

  private replaceCharacter(
    board: Array<Array<string>>,
    charToReplace: string,
    newChar: string
  ) {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === charToReplace) {
          board[i][j] = newChar;
          return board;
        }
      }
    }
    return board;
  }

  public async processMessage(): Promise<void> {
    const { sender, text, challenger, challenged, type, message } = JSON.parse(
      this.msg.content.toString()
    );

    const cacheString = await this.cacheService.findKeyContainingString(sender);

    const cacheData = await this.cacheService.getCache(cacheString);
    let cache;
    const ticTacToe = new TicTacToeImage();
    let tictactoe;
    let boardGame;

    if (cacheData) {
      cache = JSON.parse(cacheData || "");
      boardGame = [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
      ];

      tictactoe = await ticTacToe.generateImage(cache.gameStatus || boardGame);
    }

    switch (type) {
      case "firstMessage":
        await this.sendMessage(
          sender,
          { text: `Envie o contato de quem gostaria de desafiar!` },
          type,
          null,
          null
        );

        break;

      case "challengedContact":
        await this.sendMessage(
          `${challenged}@s.whatsapp.net`,
          {
            text: `${challenger} desafiou você para uma partida de jogo da velha, aceita?!
Digite 1 para ACEITAR ou 2 para RECUSAR!`,
          },
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
              message: {
                text: `${challenged} aceitou seu desafio! Vamos começar!`,
              },
            },
            {
              jid: challenged,
              message: {
                caption: `Legal! Iremos comunicar o ${challenger} e começaremos o jogo!`,
                image: tictactoe,
              },
            },
          ],
          type
        );
        cache.status = "playing";
        cache.currentPlayer =
          cache.currentPlayer === challenger ? challenged : challenger;
        cache.gameStatus = boardGame;
        this.cacheService.createCache(`${challenger}&${challenged}`, cache);
        break;

      case "gameRefused":
        await this.sendMessage(
          `${challenged}@s.whatsapp.net`,
          {
            text: `${challenger} recusou a partida!`,
          },
          type
        );
        this.cacheService.deleteCache(`${challenger}&${challenged}`);
        break;

      case "play":
        cache.currentPlayer =
          cache.currentPlayer === challenger ? challenged : challenger;
        cache.gameStatus = this.replaceCharacter(
          cache.gameStatus,
          message,
          cache.currentPlayer === challenger ? "X" : "O"
        );
        const winner = ticTacToe.checkWinner(cache.gameStatus);
        if (winner) {
          await this.sendMultipleMessages(
            [
              {
                jid: challenger,
                message: {
                  text:
                    winner === "O" ? `Parabens, você venceu!` : `Você perdeu!`,
                },
              },
              {
                jid: challenged,
                message: {
                  text:
                    winner === "X" ? `Parabens, você venceu!` : `Você perdeu!`,
                },
              },
            ],
            type
          );
          this.cacheService.deleteCache(`${challenger}&${challenged}`);
        } else if (ticTacToe.isTie(cache.gameStatus)) {
          await this.sendMultipleMessages(
            [
              {
                jid: challenger,
                message: {
                  text: "O jogo terminou em empate!",
                },
              },
              {
                jid: challenged,
                message: {
                  text: "O jogo terminou em empate!",
                },
              },
            ],
            type
          );
          this.cacheService.deleteCache(`${challenger}&${challenged}`);
        } else {
          const newTictactoe = await ticTacToe.generateImage(cache.gameStatus);
          await this.sendMultipleMessages(
            [
              {
                jid: challenger,
                message: {
                  caption: `Show! Agora é a vez do seu adversário`,
                  image: newTictactoe,
                },
              },
              {
                jid: challenged,
                message: {
                  caption: `Seu adversário jogou, sua vez!`,
                  image: newTictactoe,
                },
              },
            ],
            type
          );

          this.cacheService.createCache(`${challenger}&${challenged}`, cache);
        }

        break;

      case "wrongCharacter":
        await this.sendMessage(
          sender,
          { text: `Mensagem enviada não é válida!` },
          type
        );
        break;

      case "wrongTime":
        await this.sendMessage(
          sender,
          { text: `Ainda não é sua vez de jogar!` },
          type
        );
        break;

      case "gameInProgress":
        await this.sendMessage(
          challenger,
          { text: `Você já está em uma partida, não pode iniciar outra!` },
          type
        );
        break;

      default:
        await this.sendMessage(
          sender,
          { text: `Recebemos sua mensagem: "${text}"` },
          type
        );
    }
  }
}
