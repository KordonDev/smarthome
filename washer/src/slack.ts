import fetch from 'node-fetch'

const token = process.env.SLACK_USER_TOKEN

export interface Status {
  statusText?: string
  statusEmoji?: string
}
const profileGet = 'https://slack.com/api/users.profile.get'
const profileSet = 'https://slack.com/api/users.profile.set'

const getProfile = async () => {
  const response = await fetch(profileGet, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
  })

  const jsonResponse = await response.json()
  return {
    statusText: jsonResponse.profile.status_text,
    statusEmoji: jsonResponse.profile.status_emoji,
  }
}

const setProfile = async (statusText?: string, statusEmoji?: string) => {
  const body = {
    profile: {
      status_text: statusText,
      status_emoji: statusEmoji,
    },
  }
  await fetch(profileSet, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  }).catch((e) => console.log('error', e))
}

export { getProfile, setProfile }
