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
      'acrobatics': { 'enabled': false, 'val': 0, 'label': 'Acrobatics (Dex)' },
      'animalHandling': { 'enabled': false, 'val': 0, 'label': 'Animal Handling (Wis)' },
      'arcana': { 'enabled': false, 'val': 0, 'label': 'Arcana (Int)' },
      'athletics': { 'enabled': false, 'val': 0, 'label': 'Athletics (Str)' },
      'deception': { 'enabled': false, 'val': 0, 'label': 'Deception (Cha)' },
      'history': { 'enabled': false, 'val': 0, 'label': 'History (Int)' },
      'insight': { 'enabled': false, 'val': 0, 'label': 'Insight (Wis)' },
      'intimidation': { 'enabled': false, 'val': 0, 'label': 'Intimidation (Cha)' },
      'investigation': { 'enabled': false, 'val': 0, 'label': 'Investigation (Int)' },
      'medicine': { 'enabled': false, 'val': 0, 'label': 'Medicine (Wis)' },
      'nature': { 'enabled': false, 'val': 0, 'label': 'Nature (Int)' },
      'perception': { 'enabled': false, 'val': 0, 'label': 'Perception (Wis)' },
      'performance': { 'enabled': false, 'val': 0, 'label': 'Performance (Cha)' },
      'persuasion': { 'enabled': false, 'val': 0, 'label': 'Persuasion (Cha)' },
      'religion': { 'enabled': false, 'val': 0, 'label': 'Religion (Int)' },
      'sleightOfHand': { 'enabled': false, 'val': 0, 'label': 'Sleight Of Hand (Dex)' },
      'stealth': { 'enabled': false, 'val': 0, 'label': 'Stealth (Dex)' },
      'survival': { 'enabled': false, 'val': 0, 'label': 'Survival (Wis)' }
    },
    'notepad': '' // string of arbitrary text (limit to like 1k chars)
  }
})
newPlayerScene.leave((ctx) => ctx.reply('Exited setup'))
newPlayerScene.command('cancel', (ctx) => {
  ctx.session.nextEntry = ''
  leave()
})

newPlayerScene.on('text', (ctx) => {
  console.log(ctx.session.nextEntry)
  switch (ctx.session.nextEntry) {
    case 'name':
      if (ctx.message.text.length <= 20) {
        ctx.session.newPlayer.name = ctx.message.text
        console.log('name set as', ctx.message.text)
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
        ctx.replyWithMarkdown('Nice! now all you gotta do is complete the upcoming input hell:')

        // TODO NEXT
        // somehow do proficiency input
      } else {
        ctx.replyWithMarkdown('Sorry your message was invalid. Please send your message in the following format:\n`3 4 2 11 9 3`').then(x => {
          setTimeout(function () {
            ctx.tg.deleteMessage(x.chat.id, x.message_id)
          }, 20000)
        })
      }
      break
    default:
      console.log('Ignoring: ', ctx.session.nextEntry)
  }
  // ctx.reply('Recieved: ' + ctx.message.text)
})

newPlayerScene.action(/race-.+/, (ctx) => {
  ctx.deleteMessage()
  let match = ctx.match[0]
  match = match.replace(/race-/, '')
  console.log(match)
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
