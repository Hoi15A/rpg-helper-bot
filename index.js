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

bot.command('players', (ctx, next) => {
  return ctx.reply('Select a player: ',
    Markup.inlineKeyboard([
      [
        Markup.callbackButton('Lucius', 'p1'),
        Markup.callbackButton('Player 2', 'other'),
        Markup.callbackButton('Player 3', 'other')
      ],
      [
        Markup.callbackButton('Player 4', 'other'),
        Markup.callbackButton('Player 5', 'other'),
        Markup.callbackButton('Player 6', 'other')
      ]
    ]).extra()
  )
})

bot.action('p1', (ctx, next) => {
  ctx.answerCbQuery('P1 Selected')
  return ctx.replyWithPhoto({ 'source': './assets/placeholder-sheet.png' },
    Markup.inlineKeyboard([
      [
        Markup.callbackButton('Alter stats', 'alterstats'),
        Markup.callbackButton('More Details', 'other')
      ],
      [
        Markup.callbackButton('Spells', 'other'),
        Markup.callbackButton('Moves', 'other')
      ]
    ]).extra()).then(() => {
    ctx.deleteMessage()
    next()
  })
})

bot.action('alterstats', (ctx, next) => {
  ctx.answerCbQuery('Altering stats')
  return ctx.reply('Which stat do you want to alter?',
    Markup.inlineKeyboard([
      [
        Markup.callbackButton('Strength', 'other'),
        Markup.callbackButton('Defense', 'other')
      ],
      [
        Markup.callbackButton('Intelligence', 'other'),
        Markup.callbackButton('Moves', 'other')
      ]
    ]).extra()).then(() => {
    ctx.deleteMessage()
    next()
  })
})

bot.action('other', (ctx, next) => {
  ctx.answerCbQuery('Did stuff')
  return ctx.reply('lul no I didnt make the other buttons do stuff').then(() => next())
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
