import fetch from 'node-fetch'

const telegramAPI = 'https://api.telegram.org'
const userID = process.env.USER_ID
const token = process.argv[process.argv.indexOf('botToken') + 1]

export const loadUpdates = async (
  offset: number,
  sendCommand: (text: string) => void,
  allTopics: boolean,
  commands: string[] = []
) => {
  return await fetch(`${telegramAPI}/bot${token}/getUpdates?offset=${offset}`, {
    method: 'post',
  })
    .then((r) => r.json())
    .then((r: any) => {
      if (r.ok) {
        return r.result
      }
      throw new Error(`Reponse not ok: ${JSON.stringify(r)}`)
    })
    .then((data) => {
      let highestOffset = offset
      console.log(data)
      data.map((update: Update) => {
        if (allTopics) {
          sendCommand(update.message.text)
        }

        if (commands.includes(update.message.text) && update.message.from.id.toString() === userID) {
          sendCommand(update.message.text)
        }

        if (update.update_id >= highestOffset) {
          highestOffset = update.update_id + 1
        }
      })
      return highestOffset
    })
    .catch((e) => {
      console.log('error', e)
      return offset
    })
}

export const sendMessage = (message: string) =>
  fetch(`${telegramAPI}/bot${token}/sendMessage?chat_id=${userID}&text=${encodeURIComponent(message)}`, {
    method: 'POST',
  })
    .then(() => {
      console.log('Message posted')
    })
    .catch((err) => {
      console.log('Error :', err)
    })

interface Update {
  update_id: number
  message: Message
}
interface Message {
  message_id: number
  from: {
    id: number
    is_bot: boolean
    first_name: string
    username: string
    language_code: string
  }
  chat: {
    id: number
    first_name: string
    username: string
    type: string
  }
  date: number
  text: string
}
