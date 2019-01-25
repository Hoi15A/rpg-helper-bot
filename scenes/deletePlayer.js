const storage = require('../lib/storage.js')

const Markup = require('telegraf/markup')
const Scene = require('telegraf/scenes/base')
const Stage = require('telegraf/stage')
const { leave } = Stage

const deletePlayerScene = new Scene('deletePlayer')
deletePlayerScene.enter((ctx, next) => {
  console.log(ctx)
  let players = storage.get(ctx.update.callback_query.message.chat.id)

  if (players === undefined || players.length === 0) {
    ctx.replyWithMarkdown('No players to delete').then(x => {
      setTimeout(function () {
        ctx.tg.deleteMessage(x.chat.id, x.message_id)
      }, 5000)
    })
    leave()
    return
  }

  let buttons = []
  for (var i = 0; i < players.length; i++) {
    buttons.push([Markup.callbackButton(players[i].name, 'delete-' + players[i].name)])
  }

  let keeb = Markup.inlineKeyboard(buttons)

  return ctx.reply('Select a player you want to delete:',
    keeb.extra()
  )
})

deletePlayerScene.action(/delete-.+/, (ctx) => {
  let chatid = ctx.update.callback_query.message.chat.id
  ctx.deleteMessage()
  let match = ctx.match[0]
  match = match.replace(/delete-/, '')
  console.log('Delete', match)

  let players = storage.get(chatid)

  for (var i = 0; i < players.length; i++) {
    if (players[i].name === match) {
      players.splice(i, 1)
      break
    }
  }
  storage.set(chatid, players).then(() => {
    leave()
    ctx.replyWithMarkdown('Successfully deleted!').then(x => {
      setTimeout(function () {
        ctx.tg.deleteMessage(x.chat.id, x.message_id)
      }, 20000)
    })
  })
})

deletePlayerScene.command('cancel', leave())

exports.deletePlayerScene = deletePlayerScene
