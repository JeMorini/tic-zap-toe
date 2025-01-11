export interface Messages {
  message: {
    [key: string]: any;
    conversation?: string;
  };
  key: {
    remoteJid: string;
  };
}
