import mqtt from 'mqtt'

import { loadUpdates, sendMessage } from './telegram'
import { sendTelegram, MQTTTopics, startService, parseMessage } from './mqttNaming'

const host = process.env.HA_MQTT_HOST
const user = process.env.HA_MQTT_USER
const password = process.env.HA_MQTT_PASSWORD
const allTopics = process.argv.includes('allTopics')
const commandIndex = process.argv.indexOf('commands')
const commands = commandIndex > 0 ? process.argv[commandIndex + 1].split(',') : undefined

if (host === undefined || user === undefined || password === undefined) {
  console.log('Missing configuration parameter')
}
if (!allTopics && !commands) {
  console.log('Missing allTopics or commands')
}

const client = mqtt.connect({
  host,
  port: '1883',
  username: user,
  password,
  protocolId: 'MQTT',
  protocolVerison: 5,
})

client.on('error', function (topic: string) {
  console.log('error', topic)
})

client.on('disconnect', () => {
  console.log('disconnect')
})

client.on('connect', async function () {
  const startServiceData = startService('telegram')
  client.publish(startServiceData.topic, startServiceData.data)
  if (allTopics) {
    client.subscribe(['kordondev/#'], { qos: 0 })
  } else {
    client.subscribe([MQTTTopics.receiveTelegram], { qos: 0 })
  }

  client.on('message', async function (topic: string, messageBuffer: Buffer) {
    sendMessage(parseMessage(messageBuffer))
  })

  const sendToMqtt = (text: string) => {
    const sendTelegramData = sendTelegram(text)
    client.publish(sendTelegramData.topic, sendTelegramData.data)
  }
  loadMessages(0, sendToMqtt)
})

const loadMessages = async (offset: number, sendCommand: (text: string) => void) => {
  const nextOffset = await loadUpdates(offset, sendCommand, allTopics, commands)
  setTimeout(() => {
    loadMessages(nextOffset, sendCommand)
  }, 5000)
}
