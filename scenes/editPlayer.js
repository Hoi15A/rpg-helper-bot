const storage = require('../lib/storage.js')

const Markup = require('telegraf/markup')
const Scene = require('telegraf/scenes/base')
const Stage = require('telegraf/stage')
const { leave } = Stage

const editPlayerScene = new Scene('editPlayer')
editPlayerScene.enter((ctx, next) => {
  let players = storage.get(ctx.update.callback_query.message.chat.id)

  if (players === undefined || players.length === 0) {
    ctx.replyWithMarkdown('No players to edit.').then(x => {
      setTimeout(function () {
        ctx.tg.deleteMessage(x.chat.id, x.message_id)
      }, 5000)
    })
    leave()
    return
  }
  ctx.deleteMessage()

  let buttons = []
  for (var i = 0; i < players.length; i++) {
    buttons.push([Markup.callbackButton(players[i].name, 'selPlayer-' + players[i].name)])
  }

  let keeb = Markup.inlineKeyboard(buttons)

  return ctx.reply('Select a player you want to edit:',
    keeb.extra()
  )
})

editPlayerScene.action(/selPlayer-.+/, (ctx) => {
  ctx.session.selectedPlayer = ''
  let chatid = ctx.update.callback_query.message.chat.id
  ctx.deleteMessage()
  let match = ctx.match[0]
  match = match.replace(/selPlayer-/, '')

  let players = storage.get(chatid)
  let selectedPlayer
  for (var i = 0; i < players.length; i++) {
    if (players[i].name === match) {
      selectedPlayer = players[i]
      break
    }
  }

  // this is where it gets fun
  ctx.session.selectedPlayer = selectedPlayer.name
  ctx.replyWithMarkdown('Which information would you like?',
    Markup.inlineKeyboard([
      [
        Markup.callbackButton('Character Info', 'display-charInfo'),
        Markup.callbackButton('Stats', 'display-stats')
      ],
      [
        Markup.callbackButton('Proficiencies', 'display-profs'),
        Markup.callbackButton('Notebook', 'display-notes')
      ]
    ]).extra()
  )

  console.log(selectedPlayer.name)
  leave()
})

/*
bot.command('set', ctx => {
  storage.set(ctx.update.message.chat.id, ctx.update.message.text).then(() => {
    ctx.reply('Done')
  })
})

bot.command('get', ctx => {
  let data = storage.get(ctx.update.message.chat.id)
  ctx.reply(JSON.stringify(data))
}) */
editPlayerScene.command('cancel', leave())

exports.editPlayerScene = editPlayerScene
