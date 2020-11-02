import { setProfile, getProfile, Status } from './slack'
import mqtt from 'mqtt'

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

let oldStatus: Status = {}
let fireRunActive = false

client.on('error', function (topic: string) {
  console.log('errro', topic)
})

client.on('disconnect', () => {
  console.log('disconnect')
})

client.on('connect', function () {
  client.subscribe(['fire_run', 'arne_entering_home'], { qos: 0 })

  client.on('message', async function (topic: string, message: object) {
    console.log(topic)
    if (topic === 'fire_run') {
      oldStatus = await getProfile()
      fireRunActive = true
      setProfile('Feuerwehreinsatz', ':fire_engine:')
    }

    if (topic === 'arne_entering_home' && fireRunActive) {
      setProfile(oldStatus.statusText, oldStatus.statusEmoji)
    }
  })
})
