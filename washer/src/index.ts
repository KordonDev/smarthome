import { setProfile, getProfile, Status } from './slack'
import mqtt from 'mqtt'

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
  client.publish('start_service', JSON.stringify({ name: 'kordondev/washer/joined' }))
  startListening()

  onDetections(() =>
    client.publish('kordondev/washer/enddetected', JSON.stringify({ time: new Date().getMilliseconds() }))
  )
})
