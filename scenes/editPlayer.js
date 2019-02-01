const base = require('../lib/base.js')
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
  ctx.session.selectedPlayer = selectedPlayer
  ctx.replyWithMarkdown('What do you want to edit:',
    Markup.inlineKeyboard([
      [
        Markup.callbackButton('Initiative', 'edit-initiative'),
        Markup.callbackButton('Health', 'edit-health')
      ], /*
      [
        Markup.callbackButton('Character Info', 'edit-charInfo'),
        Markup.callbackButton('Stats', 'edit-stats')
      ], */
      [
        // Markup.callbackButton('Proficiencies', 'edit-profs'),
        Markup.callbackButton('Notes', 'edit-notes')
      ]
    ]).extra()
  )

  console.log(selectedPlayer.name)
  leave()
})

editPlayerScene.action(/edit-.+/, (ctx) => {
  ctx.deleteMessage()
  let match = ctx.match[0]
  match = match.replace(/edit-/, '')

  switch (match) {
    case 'initiative':
      ctx.replyWithMarkdown('Send a new Initiative value:\nOld value: `' + ctx.session.selectedPlayer.initiative + '`')
      ctx.session.editValue = 'initiative'
      break
    case 'health':
      ctx.replyWithMarkdown('Send a new Health value:\nOld value: `' + ctx.session.selectedPlayer.health + '`')
      ctx.session.editValue = 'health'
      break
    case 'charInfo':

      break
    case 'stats':

      break
    case 'profs':

      break
    case 'notes':
      ctx.replyWithMarkdown('Send new Notes value:\n\nOld value: `' + ctx.session.selectedPlayer.notes + '`')
      ctx.session.editValue = 'notes'
      break
    default:
  }
})

editPlayerScene.on('text', (ctx) => {
  switch (ctx.session.editValue) {
    case 'initiative':
      let initValidator = RegExp('^[0-9]{1,2}$', 'm')
      if (initValidator.test(ctx.message.text)) {
        ctx.session.selectedPlayer.initiative = ctx.message.text
        ctx.session.editValue = 'save'
      } else {
        ctx.replyWithMarkdown('Invalid inititative value, try again.').then(x => {
          setTimeout(function () {
            ctx.tg.deleteMessage(x.chat.id, x.message_id)
          }, 5000)
        })
        return
      }
      break
    case 'health':
      let healthValidator = RegExp('^[0-9]{1,2}$', 'm')
      if (healthValidator.test(ctx.message.text)) {
        ctx.session.selectedPlayer.health = ctx.message.text
        ctx.session.editValue = 'save'
      } else {
        ctx.replyWithMarkdown('Invalid health value, try again.').then(x => {
          setTimeout(function () {
            ctx.tg.deleteMessage(x.chat.id, x.message_id)
          }, 5000)
        })
        return
      }
      break

    case 'notes':
      if (ctx.message.text.length < 4050) {
        ctx.session.selectedPlayer.notes = ctx.message.text
        ctx.session.editValue = 'save'
      } else {
        ctx.replyWithMarkdown('Sorry, that\'s a bit too long.').then(x => {
          setTimeout(function () {
            ctx.tg.deleteMessage(x.chat.id, x.message_id)
          }, 5000)
        })
        return
      }
      break
  }

  if (ctx.session.editValue === 'save') {
    let players = storage.get(ctx.update.message.chat.id)
    for (var i = 0; i < players.length; i++) {
      if (ctx.session.selectedPlayer.name === players[i].name) {
        players[i] = ctx.session.selectedPlayer
        break
      }
    }
    storage.set(ctx.update.message.chat.id, players).then(() => {
      base.showMainMenu(ctx)
      leave()
    }).catch(e => {
      console.error('Err editing player:', e)
    })
    ctx.session.editValue = ''
  }
  // ctx.reply('Recieved: ' + ctx.message.text)
})

/*

Base info:
    'name': '',
    'race': '', // Dragonborn, Dwarf, Elf, Gnome, Half-Elf, Halfling, Half-Orc, Human, Tiefling
    'class': '', // Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard
    'level': 0, // 1-99

Initiative

Health

Stats:

    'baseStats': { // Formula for modifiers: Math.floor((stat - 10) / 2)
      'str': 0, // Strength: 0-99
      'dex': 0, // Dexterity: 0-99
      'con': 0, // Constitution: 0-99
      'int': 0, // Intelligence: 0-99
      'wis': 0, // Wisdom: 0-99
      'chr': 0 // Charisma: 0-99
    },
    'armor': 0,
    'initiative': 0,
    'speed': 0,

Skills

Notepad

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
