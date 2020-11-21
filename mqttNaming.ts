// kordondev/<appName>/<command>/<room?>
export enum MQTTTopics {
  receiveTelegram = "kordondev/telegram/receive",
  sendTelegram = "kordondev/telegram/send",
  startFireAlarm = "kordondev/fireRun/start",
  arneBackHome = "kordondev/home/back/arne",
  washerEnd = "kordondev/washer/enddetected",
}

interface MQTTPackage {
  topic: string;
  data: string;
}

export const startService = (service: string): MQTTPackage => {
  return { topic: `kordondev/${service}/start`, data: JSON.stringify({}) };
};

export const sendTelegram = (text: string): MQTTPackage => {
  return {
    topic: MQTTTopics.sendTelegram,
    data: JSON.stringify({ text: text }),
  };
};

export interface FireRunData {
  title: string;
  addresse: string;
  text: string;
  vehicles: string[];
  in5Minutes: number;
  in10Minutes: number;
}

export const startFireRun = (data: FireRunData): MQTTPackage => {
  return { topic: MQTTTopics.startFireAlarm, data: JSON.stringify(data) };
};

export interface WasherEndData {
  time: number;
}
export const washerEnd = (data: WasherEndData): MQTTPackage => {
  return { topic: MQTTTopics.washerEnd, data: JSON.stringify(data) };
};

export const parseMessage = (messageBuffer: Buffer) => JSON.parse(messageBuffer.toString('utf-8')
