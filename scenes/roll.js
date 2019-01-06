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
        Markup.callbackButton('D4', 'd4'),
        Markup.callbackButton('D6', 'd6'),
        Markup.callbackButton('D8', 'd8')
      ],
      [
        Markup.callbackButton('D12', 'd12'),
        Markup.callbackButton('D20', 'd20'),
        Markup.callbackButton('D1k', 'd1000')
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

rollScene.action('d4', (ctx, next) => {
  basicRollAction(ctx, 4)
})
rollScene.action('d6', (ctx, next) => {
  basicRollAction(ctx, 6)
})
rollScene.action('d8', (ctx, next) => {
  basicRollAction(ctx, 8)
})
rollScene.action('d12', (ctx, next) => {
  basicRollAction(ctx, 12)
})
rollScene.action('d20', (ctx, next) => {
  basicRollAction(ctx, 20)
})
rollScene.action('d1000', (ctx, next) => {
  basicRollAction(ctx, 1000)
})

rollScene.command('cancel', leave())

exports.rollScene = rollScene
