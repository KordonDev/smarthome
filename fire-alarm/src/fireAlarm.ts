import fetch from 'node-fetch'
import FormData from 'form-data'

const username = process.env.DIVERA_USERNAME
const password = process.env.DIVERA_PASSWORD
if (username === undefined || password === undefined) {
  throw new Error('Missing username or password')
}
const knownAlarms: number[] = []
let token: string | null = null
let expireDate: Date | null = null
let vehicles: Vehicle[] = []

export const getToken = () => {
  const formData = new FormData()

  formData.append('Login[username]', username)
  formData.append('Login[password]', password)
  formData.append('Login[cookie]', '0')
  formData.append('Login[cookie]', '1')
  formData.append('Login[remember]', '0')
  formData.append('Login[remember]', '1')

  return fetch('https://www.divera247.com/login.html?step=1&msg=&referrer=', {
    method: 'POST',
    body: formData as any,
  }).then((response) => {
    const cookie = response.headers.get('set-cookie')
    if (cookie) {
      const s = cookie.split(';').filter((sub) => sub.includes('jwt'))[0]
      token = s.substring(s.indexOf('_jwt'))

      const expiresToken = 'expires='
      const expireString = cookie.split(';').filter((sub) => sub.includes(expiresToken))[0]
      const expire = expireString.substring(expireString.indexOf(expiresToken) + expiresToken.length)
      expireDate = new Date(expire)
    }
  })
}

const loadData = async (cb: (data: object) => void, initalCall?: boolean) => {
  const nowSeconds = new Date().getTime() / 1000
  if (!token || !expireDate || expireDate.getTime() / 1000 - nowSeconds < 60 * 60 * 12) {
    await getToken()
  }
  fetch(`https://www.divera247.com/api/pull?${nowSeconds.toString()}`, {
    headers: {
      cookie: token || '',
      'content-type': 'application/json; charset=UTF-8',
    },
  })
    .catch(console.error)
    .then((res: any) => res.json())
    .then((res: DiveraRespose) => {
      vehicles = Object.entries(res.data.cluster.vehicle).map(([key, value]) => ({
        id: key,
        name: value.name,
        shortname: value.shortname,
        fullname: value.fullname,
      }))
      return res
    })
    .then((res: DiveraRespose) => res.data.alarm.items)
    .then((alarms: { [key: string]: Alarm }) => {
      Object.values(alarms).map((alarm) => {
        if (knownAlarms.includes(alarm.id) || initalCall) {
          console.log('Alter Alarm:', alarm.title)
        } else {
          const alarmData = {
            title: alarm.title,
            addresse: alarm.address,
            text: alarm.text, // isHTML
            vehicles: alarm.vehicle.map((vehicleId) => vehicles.find((v) => v.id === vehicleId.toString())?.shortname),
            in5Minutes: alarm.ucr_answeredcount['29657'],
            in10Minutes: alarm.ucr_answeredcount['29658'],
          }
          cb(alarmData)
          console.log(alarmData)
          knownAlarms.push(alarm.id)
        }
      })
      console.log('---- New -------')
    })
}

export const start = (cb: (data: object) => void) => {
  loadData(cb, true)
  setInterval(() => {
    loadData(cb)
  }, 20000)
}

interface DiveraRespose {
  data: {
    ts: number
    usr_active: number
    user: {
      firstname: string
      lastname: string
    }
    status: {
      status_id: number
    }
    cluster: {
      name: string
      vehicle: object
      vehiclesorting: any[]
    }
    alarm: {
      items: {
        [key: string]: Alarm
      }
      new: number
      ts: number
    }
  }
}

interface Alarm {
  id: number
  author_id: number
  address: string
  new: boolean
  notification_type: number
  text: string
  title: string
  type: string
  vehicle: number[]
  lat: number
  long: number
  ucr_answered: {}
  ucr_answeredcount: { '29657': number; '29658': number }
}

interface Vehicle {
  id: string
  fullname: string
  shortname: string
  name: string
}

enum Answer {
  MINUTEN5 = '29657',
  MINUTEN10 = '29658',
  NICHT = '296551',
  URLAUB = '?',
}
