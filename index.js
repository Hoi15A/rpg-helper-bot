const base = require('./lib/base.js')
const webServer = require('./lib/webserver.js')
const webhookPath = '/wh-' + require('crypto').randomBytes(8).toString('hex')
const config = base.getConfig()

const dir = './tmp'
const fs = require('fs')
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
}

const Telegraf = require('telegraf')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const { leave } = Stage

const bot = new Telegraf(config.telegram.token)

bot.telegram.getMe().then((botInfo) => {
  bot.options.username = botInfo.username
})

const { newPlayerScene } = require('./scenes/newPlayer.js')
const { deletePlayerScene } = require('./scenes/deletePlayer.js')
const { showPlayerScene } = require('./scenes/showPlayer.js')
const { editPlayerScene } = require('./scenes/editPlayer.js')

const { rollScene } = require('./scenes/roll.js')

const stage = new Stage([newPlayerScene, deletePlayerScene, showPlayerScene, editPlayerScene, rollScene])
bot.use(session())
bot.use(stage.middleware())

bot.command('start', (ctx, next) => {
  leave()
  return base.showMainMenu(ctx)
})

bot.command('menu', (ctx, next) => {
  leave()
  return base.showMainMenu(ctx)
})

bot.command('github', (ctx, next) => {
  return ctx.replyWithMarkdown('[Github Repository](https://github.com/Hoi15A/rpg-helper-bot)')
})

bot.action('roll', (ctx, next) => {
  ctx.answerCbQuery('Roll Menu')
  ctx.scene.enter('roll')
})

bot.action('newPlayer', (ctx, next) => {
  ctx.answerCbQuery('Entering Setup')
  ctx.scene.enter('newPlayer')
})

bot.action('showPlayer', (ctx, next) => {
  ctx.answerCbQuery('Entering Show')
  ctx.scene.enter('showPlayer')
})

bot.action('editPlayer', (ctx, next) => {
  ctx.answerCbQuery('Entering Edit')
  ctx.scene.enter('editPlayer')
})

bot.action('deletePlayer', (ctx, next) => {
  ctx.answerCbQuery('Entering Delete')
  ctx.scene.enter('deletePlayer')
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
