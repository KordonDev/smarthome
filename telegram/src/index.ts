import mqtt from 'mqtt'

import { loadUpdates, sendMessage } from './telegram'

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
  client.publish('start_service', JSON.stringify({ name: 'telegram' }))
  if (allTopics) {
    client.subscribe(['#'], { qos: 0 })
  } else {
    client.subscribe(['telegram'], { qos: 0 })
  }

  client.on('message', async function (topic: string, messageBuffer: Buffer) {
    const message = JSON.parse(messageBuffer.toString('utf-8'))
    sendMessage(message)
  })

  const sendToMqtt = (text: string) => client.publish('from_telegram', JSON.stringify({ text: text }))
  loadMessages(0, sendToMqtt)
})

const loadMessages = async (offset: number, sendCommand: (text: string) => void) => {
  const nextOffset = await loadUpdates(offset, sendCommand, allTopics, commands)
  setTimeout(() => {
    loadMessages(nextOffset, sendCommand)
  }, 5000)
}
