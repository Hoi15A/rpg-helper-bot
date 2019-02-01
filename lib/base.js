const yaml = require('js-yaml')
const fs = require('fs')
const Markup = require('telegraf/markup')

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
  },
  showMainMenu: function (ctx) {
    return ctx.reply('Main Menu: ',
      Markup.inlineKeyboard([
        [
          Markup.callbackButton('Show Player', 'showPlayer'),
          Markup.callbackButton('Edit Player', 'editPlayer')
        ],
        [
          Markup.callbackButton('New Player', 'newPlayer'),
          Markup.callbackButton('Delete Player', 'deletePlayer')
        ],
        [
          Markup.callbackButton('Roll 🎲', 'roll')
        ]
      ]).extra()
    )
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
      'port': process.env.PORT
    },
    'env': {
      'isProd': true
    }
  }
  return config
}
