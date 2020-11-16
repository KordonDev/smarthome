import audioDetector from 'clap-detector'

const config = {
  AUDIO_SOURCE: 'alsa hw:1,0',
  CLAP_AMPLITUDE_THRESHOLD: 0.25,
  CLAP_ENERGY_THRESHHOLD: 0.3,
  CLAP_MAX_DURATION: 1500,
}

const startListening = () => audioDetector.start(config)
const onDetections = (cb: () => void) => {
  audioDetector.onDetections(3, 2000, () => {
    cb()
  })
}

export { startListening, onDetections }
