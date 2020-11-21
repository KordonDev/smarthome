import { setProfile, getProfile, Status } from './slack'
import mqtt from 'mqtt'
import { MQTTTopics, startService } from './mqttNaming'

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
const fireRunStatusText = 'Feuerwehreinsatz'
const fireRunStatusIcon = ':fire_engine:'

client.on('error', function (topic: string) {
  console.log('errro', topic)
})

client.on('disconnect', () => {
  console.log('disconnect')
})

client.on('connect', function () {
  const startServiceData = startService('slack')
  client.publish(startServiceData.topic, startServiceData.data)
  client.subscribe([MQTTTopics.startFireAlarm, MQTTTopics.arneBackHome], { qos: 0 })

  client.on('message', async function (topic: string, message: object) {
    if (isWorktime()) {
      if (topic === MQTTTopics.startFireAlarm) {
        const currentStatus = await getProfile()
        if (currentStatus.statusText !== fireRunStatusText) {
          oldStatus = currentStatus
        }
        fireRunActive = true
        setProfile(fireRunStatusText, fireRunStatusIcon)
      }
    }

    if (topic === MQTTTopics.arneBackHome && fireRunActive) {
      setProfile(oldStatus.statusText, oldStatus.statusEmoji)
      fireRunActive = false
    }
  })
})

const isWorktime = () => {
  const now = new Date()
  // weekend
  if (now.getDay() === 0 || now.getDay() == 6) {
    return false
  }
  // Before 6 or after 17 hour
  if (now.getHours() < 6 || now.getHours() > 17) {
    return false
  }
  return true
}
