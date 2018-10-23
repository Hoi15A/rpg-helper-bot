const base = require('./lib/base.js')
const webServer = require('./lib/webserver.js')
const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')
const webhookPath = '/wh-' + require('crypto').randomBytes(8).toString('hex')
const config = base.getConfig()

const bot = new Telegraf(config.telegram.token)

bot.telegram.getMe().then((botInfo) => {
  bot.options.username = botInfo.username
})

bot.command('players', ({ reply }) => {
  return reply('Select a player: ',
    Markup.inlineKeyboard([
      [
        Markup.callbackButton('Player 1', 'p1'),
        Markup.callbackButton('Player 2', 'p2'),
        Markup.callbackButton('Player 3', 'p3')
      ],
      [
        Markup.callbackButton('Player 4', 'p4'),
        Markup.callbackButton('Player 5', 'p5'),
        Markup.callbackButton('Player 6', 'p6')
      ],
      [
        Markup.callbackButton('Player 7', 'p7'),
        Markup.callbackButton('Player 8', 'p8'),
        Markup.callbackButton('Player 9', 'p9')
      ]
    ]).extra()
  )
})

bot.action('p1', (ctx, next) => {
  ctx.answerCbQuery('P1 Selected')
  return ctx.reply('_p1 stats here_').then(() => next())
})

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
