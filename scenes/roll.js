const dice = require('../lib/dice.js')

const Markup = require('telegraf/markup')
const Scene = require('telegraf/scenes/base')
const Stage = require('telegraf/stage')
const { leave } = Stage

const rollScene = new Scene('roll')
rollScene.enter((ctx, next) => {
  return ctx.reply('Roll a die:',
    Markup.inlineKeyboard([
      [
        Markup.callbackButton('D00', 'd00'),
        Markup.callbackButton('D4', 'd4'),
        Markup.callbackButton('D6', 'd6'),
        Markup.callbackButton('D8', 'd8')
      ],
      [
        Markup.callbackButton('D10', 'd10'),
        Markup.callbackButton('D12', 'd12'),
        Markup.callbackButton('D20', 'd20')
      ]
    ]).extra()
  )
})

function basicRollAction (ctx, num) {
  ctx.deleteMessage()
  ctx.answerCbQuery('Rolling...')
  let roll = dice.roll('standard', 1, num)[0]
  ctx.replyWithMarkdown('Rolled a D' + num + ': `' + roll + '`').then(x => {
    setTimeout(function () {
      ctx.tg.deleteMessage(x.chat.id, x.message_id)
    }, 20000)
  })
  leave()
}

// TODO: (very low priority) /d[0-9]+/ instead of this copy paste shit
rollScene.action('d00', (ctx, next) => {
  ctx.deleteMessage()
  ctx.answerCbQuery('Rolling...')
  let roll = dice.roll('percentile', 1, null)[0]
  ctx.replyWithMarkdown('Rolled a D00: `' + roll + '`').then(x => {
    setTimeout(function () {
      ctx.tg.deleteMessage(x.chat.id, x.message_id)
    }, 20000)
  })
  leave()
})
rollScene.action('d4', (ctx, next) => {
  basicRollAction(ctx, 4)
})
rollScene.action('d6', (ctx, next) => {
  basicRollAction(ctx, 6)
})
rollScene.action('d8', (ctx, next) => {
  basicRollAction(ctx, 8)
})
rollScene.action('d10', (ctx, next) => {
  basicRollAction(ctx, 10)
})
rollScene.action('d12', (ctx, next) => {
  basicRollAction(ctx, 12)
})
rollScene.action('d20', (ctx, next) => {
  basicRollAction(ctx, 20)
})

rollScene.command('cancel', leave())

exports.rollScene = rollScene
