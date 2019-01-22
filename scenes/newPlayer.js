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
    'baseStats': {
      'str': 0, // Strength: 0-99
      'dex': 0, // Dexterity: 0-99
      'con': 0, // Constitution: 0-99
      'int': 0, // Intelligence: 0-99
      'wis': 0, // Wisdom: 0-99
      'chr': 0 // Charisma: 0-99
    },
    'skills': { // or proficiencies
      'acrobatics': { 'enabled': false, 'val': 0, 'label': 'Acrobatics' },
      'animalHandling': { 'enabled': false, 'val': 0, 'label': 'Animal Handling' },
      'arcana': { 'enabled': false, 'val': 0, 'label': 'Arcana' },
      'athletics': { 'enabled': false, 'val': 0, 'label': 'Athletics' },
      'deception': { 'enabled': false, 'val': 0, 'label': 'Deception' },
      'history': { 'enabled': false, 'val': 0, 'label': 'History' },
      'insight': { 'enabled': false, 'val': 0, 'label': 'Insight' },
      'intimidation': { 'enabled': false, 'val': 0, 'label': 'Intimidation' },
      'investigation': { 'enabled': false, 'val': 0, 'label': 'Investigation' },
      'medicine': { 'enabled': false, 'val': 0, 'label': 'Medicine' },
      'nature': { 'enabled': false, 'val': 0, 'label': 'Nature' },
      'perception': { 'enabled': false, 'val': 0, 'label': 'Perception' },
      'performance': { 'enabled': false, 'val': 0, 'label': 'Performance' },
      'persuasion': { 'enabled': false, 'val': 0, 'label': 'Persuasion' },
      'religion': { 'enabled': false, 'val': 0, 'label': 'Religion' },
      'sleightOfHand': { 'enabled': false, 'val': 0, 'label': 'Sleight Of Hand' },
      'stealth': { 'enabled': false, 'val': 0, 'label': 'Stealth' },
      'survival': { 'enabled': false, 'val': 0, 'label': 'Survival' }
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
        ctx.reply('Select Race:',
          Markup.inlineKeyboard([
            [// Dragonborn, Dwarf, Elf, Gnome, Half-Elf, Halfling, Half-Orc, Human, Tiefling
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
  console.log(match)
  ctx.session.newPlayer.race = match
  ctx.answerCbQuery('Class selected.')
})

exports.newPlayerScene = newPlayerScene
