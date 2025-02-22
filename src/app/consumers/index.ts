import { firstMessage } from "./firstMessage";
import { challengedContact } from "./challengedContact";
import { gameAccepted } from "./gameAccepted";
import { gameRefused } from "./gameRefused";
import { incompatible } from "./incompatible";
import { play } from "./play";
import { wrongCharacter } from "./wrongCharacter";
import { wrongTime } from "./wrongTime";
import { gameInProgress } from "./gameInProgress";

const consumers = [
  firstMessage,
  challengedContact,
  gameAccepted,
  gameRefused,
  incompatible,
  play,
  wrongCharacter,
  wrongTime,
  gameInProgress,
];

export async function startConsumers(channel: any, sock: any) {
  consumers.map((consumer) => {
    try {
      consumer(channel, sock);
      console.log(`Consumer ${consumer.name} iniciado com sucesso.`);
    } catch (error) {
      console.error(`Erro ao iniciar o consumer ${consumer.name}:`, error);
    }
  });
}
