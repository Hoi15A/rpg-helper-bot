const storage = require('../lib/storage.js')

const Markup = require('telegraf/markup')
const Scene = require('telegraf/scenes/base')
const Stage = require('telegraf/stage')
const { leave } = Stage

const newPlayerScene = new Scene('newPlayer')
newPlayerScene.enter((ctx) => {
  ctx.replyWithMarkdown('*Creating a new Player*\n\nEnter a name: ')

  ctx.session.nextEntry = 'name'
  ctx.session.newPlayer = {
    'name': '',
    'race': '', // Dragonborn, Dwarf, Elf, Gnome, Half-Elf, Halfling, Half-Orc, Human, Tiefling
    'class': '', // Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard
    'level': 0, // 1-99
    // 'health'
    // 'gold'
    'armor': 0,
    'initiative': 0,
    'speed': 0,
    'baseStats': { // Formula for modifiers: Math.floor((stat - 10) / 2)
      'str': 0, // Strength: 0-99
      'dex': 0, // Dexterity: 0-99
      'con': 0, // Constitution: 0-99
      'int': 0, // Intelligence: 0-99
      'wis': 0, // Wisdom: 0-99
      'chr': 0 // Charisma: 0-99
    },
    'skills': { // or proficiencies
      'acrobatics': { 'val': 0, 'label': 'Acrobatics (Dex)' },
      'animalHandling': { 'val': 0, 'label': 'Animal Handling (Wis)' },
      'arcana': { 'val': 0, 'label': 'Arcana (Int)' },
      'athletics': { 'val': 0, 'label': 'Athletics (Str)' },
      'deception': { 'val': 0, 'label': 'Deception (Cha)' },
      'history': { 'val': 0, 'label': 'History (Int)' },
      'insight': { 'val': 0, 'label': 'Insight (Wis)' },
      'intimidation': { 'val': 0, 'label': 'Intimidation (Cha)' },
      'investigation': { 'val': 0, 'label': 'Investigation (Int)' },
      'medicine': { 'val': 0, 'label': 'Medicine (Wis)' },
      'nature': { 'val': 0, 'label': 'Nature (Int)' },
      'perception': { 'val': 0, 'label': 'Perception (Wis)' },
      'performance': { 'val': 0, 'label': 'Performance (Cha)' },
      'persuasion': { 'val': 0, 'label': 'Persuasion (Cha)' },
      'religion': { 'val': 0, 'label': 'Religion (Int)' },
      'sleightOfHand': { 'val': 0, 'label': 'Sleight Of Hand (Dex)' },
      'stealth': { 'val': 0, 'label': 'Stealth (Dex)' },
      'survival': { 'val': 0, 'label': 'Survival (Wis)' }
    },
    'notepad': '' // string of arbitrary text (limit to like 1k chars)
  }

  ctx.session.skillList = []
  ctx.session.skillIndex = 0
  for (var v in ctx.session.newPlayer.skills) {
    if (ctx.session.newPlayer.skills.hasOwnProperty(v)) {
      ctx.session.skillList.push(v)
    }
  }
})
newPlayerScene.leave((ctx) => ctx.reply('Exited setup'))
newPlayerScene.command('cancel', (ctx) => {
  ctx.session.nextEntry = ''
  leave()
})

newPlayerScene.on('text', (ctx) => {
  switch (ctx.session.nextEntry) {
    case 'name':
      if (ctx.message.text.length <= 20) {
        ctx.session.newPlayer.name = ctx.message.text
        ctx.session.nextEntry = ''
        ctx.reply('Hello ' + ctx.message.text + '!\nSelect a Race:',
          Markup.inlineKeyboard([
            [
              Markup.callbackButton('Dragonborn', 'race-dragonborn'),
              Markup.callbackButton('Dwarf', 'race-dwarf'),
              Markup.callbackButton('Elf', 'race-elf')
            ],
            [
              Markup.callbackButton('Gnome', 'race-gnome'),
              Markup.callbackButton('Half-Elf', 'race-halfElf'),
              Markup.callbackButton('Halfling', 'race-halfling')
            ],
            [
              Markup.callbackButton('Half-Orc', 'race-orc'),
              Markup.callbackButton('Human', 'race-human'),
              Markup.callbackButton('Tiefling', 'race-tiefling')
            ]
          ]).extra()
        )
      } else {
        ctx.replyWithMarkdown('Sorry, that name is a bit too long.\nPlease enter a shorter one:')
      }
      break
    case 'lvlEtc':
      let lvlEtcValidator = RegExp('^([0-9]{1,2} ){3}([0-9]{1,2})$', 'm')
      if (lvlEtcValidator.test(ctx.message.text)) {
        let lvlEtcValues = ctx.message.text.split(' ')
        ctx.session.newPlayer.level = lvlEtcValues[0]
        ctx.session.newPlayer.armor = lvlEtcValues[1]
        ctx.session.newPlayer.initiative = lvlEtcValues[2]
        ctx.session.newPlayer.speed = lvlEtcValues[3]
        ctx.replyWithMarkdown('Nice!\n\nNext please enter the following base stat values separated by spaces:\n1. Strength\n2. Dexterity\n3. Constitution\n4. Intelligence\n5. Wisdom\n6. Charisma\n\nExample: `3 4 2 11 9 3`')
        ctx.session.nextEntry = 'baseStats'
      } else {
        ctx.replyWithMarkdown('Sorry your message was invalid. Please send your message in the following format:\n`1 12 5 3`').then(x => {
          setTimeout(function () {
            ctx.tg.deleteMessage(x.chat.id, x.message_id)
          }, 20000)
        })
      }
      break
    case 'baseStats':
      let statValidator = RegExp('^([0-9]{1,2} ){5}([0-9]{1,2})$', 'm')
      if (statValidator.test(ctx.message.text)) {
        let statValues = ctx.message.text.split(' ')
        ctx.session.newPlayer.baseStats.str = statValues[0]
        ctx.session.newPlayer.baseStats.dex = statValues[1]
        ctx.session.newPlayer.baseStats.con = statValues[2]
        ctx.session.newPlayer.baseStats.int = statValues[3]
        ctx.session.newPlayer.baseStats.wis = statValues[4]
        ctx.session.newPlayer.baseStats.chr = statValues[5]

        ctx.replyWithMarkdown('Nice!\n\nNext enter the proficiencies as numbers. If you set a value to 0 the proficiency is considered not active.\n\nEnter a value for Acrobatics (Dex):')
        ctx.session.nextEntry = 'proficiencies'
      } else {
        ctx.replyWithMarkdown('Sorry your message was invalid. Please send your message in the following format:\n`3 4 2 11 9 3`').then(x => {
          setTimeout(function () {
            ctx.tg.deleteMessage(x.chat.id, x.message_id)
          }, 20000)
        })
      }
      break
    case 'proficiencies':
      let profValidator = RegExp('^[0-9]{1,2}$', 'm')
      if (profValidator.test(ctx.message.text)) {
        let currProf = ctx.session.skillList[ctx.session.skillIndex]
        ctx.session.newPlayer.skills[currProf].val = ctx.message.text

        if (ctx.session.skillList.length === ctx.session.skillIndex + 1) {
          ctx.session.nextEntry = 'notepad'
          ctx.replyWithMarkdown('Lastly, enter anything else you would like to have stored in your notepad (4000 character limit):')
          break
        }
        ctx.session.skillIndex++
        let nextSkill = ctx.session.skillList[ctx.session.skillIndex]
        ctx.replyWithMarkdown('Now enter a number for ' + ctx.session.newPlayer.skills[nextSkill].label)
      } else {
        ctx.replyWithMarkdown('Sorry your message was invalid. Please send your message in the following format:\n`2` or `41`').then(x => {
          setTimeout(function () {
            ctx.tg.deleteMessage(x.chat.id, x.message_id)
          }, 20000)
        })
      }
      break
    case 'notepad':
      // 4000 char limit
      if (ctx.message.text.length < 4050) {
        ctx.session.newPlayer.notepad = ctx.message.text
        let player = ctx.session.newPlayer
        let data = storage.get(ctx.update.message.chat.id)
        if (data === undefined) {
          data = [player]
        } else {
          data.push(player)
        }
        storage.set(ctx.update.message.chat.id, data).then(() => {
          ctx.replyWithMarkdown('That\'s it!')
          leave()
        })
      } else {
        ctx.replyWithMarkdown('Its nice that you have so much to say, but sadly its above the 4000 character limit. Please shorten your text:').then(x => {
          setTimeout(function () {
            ctx.tg.deleteMessage(x.chat.id, x.message_id)
          }, 20000)
        })
      }
      break
    default:
      // do nothing
  }
  // ctx.reply('Recieved: ' + ctx.message.text)
})

newPlayerScene.action(/race-.+/, (ctx) => {
  ctx.deleteMessage()
  let match = ctx.match[0]
  match = match.replace(/race-/, '')
  ctx.session.newPlayer.race = match
  ctx.answerCbQuery('Race selected.')

  ctx.reply('Race selected!\n\nSelect a class:',
    Markup.inlineKeyboard([
      [// Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard
        Markup.callbackButton('Barbarian', 'class-barbarian'),
        Markup.callbackButton('Bard', 'class-bard'),
        Markup.callbackButton('Cleric', 'class-cleric')
      ],
      [
        Markup.callbackButton('Druid', 'class-druid'),
        Markup.callbackButton('Fighter', 'class-fighter'),
        Markup.callbackButton('Monk', 'class-monk')
      ],
      [
        Markup.callbackButton('Paladin', 'class-paladin'),
        Markup.callbackButton('Ranger', 'class-ranger'),
        Markup.callbackButton('Rogue', 'class-rogue')
      ],
      [
        Markup.callbackButton('Sorcerer', 'class-sorcerer'),
        Markup.callbackButton('Warlock', 'class-warlock'),
        Markup.callbackButton('Wizard', 'class-wizard')
      ]
    ]).extra()
  )
})

newPlayerScene.action(/class-.+/, (ctx) => {
  ctx.deleteMessage()
  let match = ctx.match[0]
  match = match.replace(/class-/, '')
  ctx.session.newPlayer.class = match
  ctx.answerCbQuery('Class selected.')

  ctx.replyWithMarkdown('Class selected!\n\nPlease enter the following values all at once separated by spaces:\n1. Level\n2. Armor\n3. Initiative\n4. Speed\n\nExample: `1 12 5 3`')
  ctx.session.nextEntry = 'lvlEtc'
})

exports.newPlayerScene = newPlayerScene
