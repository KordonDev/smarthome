import mqtt from 'mqtt'
import { startService, washerEnd } from './mqttNaming'

import { startListening, onDetections } from './washer'

const host = process.env.HA_MQTT_HOST
const user = process.env.HA_MQTT_USER
const password = process.env.HA_MQTT_PASSWORD

if (host === undefined || user === undefined || password === undefined) {
  console.log('Missing configuration parameter')
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

client.on('connect', function () {
  const startServiceData = startService('washer')
  client.publish(startServiceData.topic, startServiceData.data)
  startListening()

  onDetections(() => {
    const endDetectedData = washerEnd({ time: new Date().getMilliseconds() })
    client.publish(endDetectedData.topic, endDetectedData.data)
  })
})
