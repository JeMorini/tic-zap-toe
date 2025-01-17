import { BotService } from "./app/services/startBotService";

async function main() {
  const botService = new BotService();
  await botService.start();
}

main();
