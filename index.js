const base = require('./lib/base.js')
const webServer = require('./lib/webserver.js')
const webhookPath = '/wh-' + require('crypto').randomBytes(8).toString('hex')
const config = base.getConfig()

const Telegraf = require('telegraf')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const { enter } = Stage

const bot = new Telegraf(config.telegram.token)

bot.telegram.getMe().then((botInfo) => {
  bot.options.username = botInfo.username
})

const { setupScene } = require('./scenes/setup.js')

const stage = new Stage([setupScene])
bot.use(session())
bot.use(stage.middleware())
bot.command('start', enter('setup'))

// Set up connection to api according to config
if (config.telegram.useWebhook) {
  if (config.env.isProd) {
    bot.telegram.setWebhook(config.webserver.webhookProd + webhookPath)
  } else {
    bot.telegram.setWebhook(config.webserver.webhookDev + webhookPath)
  }
  webServer.startWebhook(bot, webhookPath, config.webserver.port)
} else {
  bot.telegram.setWebhook('')
  bot.startPolling()
  console.log('Bot Polling...')
}
