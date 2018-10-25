const yaml = require('js-yaml')
const fs = require('fs')

module.exports = {
  getConfig: function () {
    if (process.env.HEROKU) {
      return getHerokuConfig()
    }
    try {
      let config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'))
      if (!config.telegram || !config.telegram.token || config.telegram.token === '') {
        console.log('Token is missing')
        process.exit(1)
      }
      return config
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  }
}

function getHerokuConfig () {
  let config = {
    'telegram': {
      'token': process.env.TG_TOKEN,
      'useWebhook': true
    },
    'webserver': {
      'webhookProd': process.env.WH_URL,
      'port': 80
    },
    'env': {
      'isProd': true
    }
  }
  return config
}
