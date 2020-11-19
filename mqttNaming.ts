// kordondev/<appName>/<command>/<room?>
export enum MQTTTopics {
    receiveTelegram = 'kordondev/telegram/receive',
    sendTelegram = 'kordondev/telegram/send',
    startFireAlarm = 'kordondev/fireRun/start',
    arneBackHome = 'kordondev/home/back/arne',
    washerEnd = 'kordondev/washer/enddetected'
}

export const startService = (service: string) => {
    return [`kordondev/${service}/start`, {}]
}

export const sendTelegram = (text: string) => {
    return [MQTTTopics.sendTelegram, {text: text}]
}

export interface FireRunData {
    title: string
    addresse: string
    text: string
    vehicles: string[]
    in5Minutes: number
    in10Minutes: number
}

export const startFireRun = (data: FireRunData) => {
    return [MQTTTopics.startFireAlarm, data]
}

export interface WasherEndData {
    time: number
}
export const washerEnd = (data: WasherEndData) => {
    return [MQTTTopics.washerEnd, data]
}
