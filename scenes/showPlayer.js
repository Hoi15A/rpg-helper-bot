const base = require('../lib/base.js')
const storage = require('../lib/storage.js')
const fs = require('fs')

const path = require('path')
const assetPath = path.resolve('assets')

const { registerFont, createCanvas, loadImage } = require('canvas')
registerFont(path.join(assetPath, 'PressStart2P-Regular.ttf'), { family: 'Press Start 2P' })

const Markup = require('telegraf/markup')
const Scene = require('telegraf/scenes/base')
const Stage = require('telegraf/stage')
const { leave } = Stage

const showPlayerScene = new Scene('showPlayer')
showPlayerScene.enter((ctx, next) => {
  let players = storage.get(ctx.update.callback_query.message.chat.id)

  if (players === undefined || players.length === 0) {
    ctx.replyWithMarkdown('No players to show.').then(x => {
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

  return ctx.reply('Select a player you want to show:',
    keeb.extra()
  )
})

showPlayerScene.action(/selPlayer-.+/, (ctx) => {
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

showPlayerScene.action(/display-.+/, (ctx) => {
  let chatid = ctx.update.callback_query.message.chat.id
  ctx.deleteMessage()
  let match = ctx.match[0]
  match = match.replace(/display-/, '')
  console.log('Display: ', match)
  // ctx.session.selectedPlayer
  let players = storage.get(chatid)
  let currPlayer
  for (var i = 0; i < players.length; i++) {
    if (players[i].name === ctx.session.selectedPlayer) {
      currPlayer = players[i]
    }
  }
  // console.log(currPlayer)

  switch (match) {
    case 'charInfo':
      // 1440 x 1400
      const canvas = createCanvas(1440, 1400)
      const cvctx = canvas.getContext('2d')
      loadImage(path.join(assetPath, 'charinfo.png')).then(img => {
        cvctx.drawImage(img, 0, 0)

        // Image manipulation
        cvctx.font = '85px Press Start 2P'
        cvctx.fillStyle = '#382000'
        console.log(currPlayer.name)
        cvctx.fillText(currPlayer.name, 120, 400)
        cvctx.font = '75px Press Start 2P'
        let race = formatRace(currPlayer.race)
        let classTxt = currPlayer.class.charAt(0).toUpperCase() + currPlayer.class.slice(1)
        cvctx.fillText('Race:  ' + race, 120, 650)
        cvctx.fillText('Class: ' + classTxt, 120, 750)

        cvctx.fillText('Level:  ' + currPlayer.level, 120, 970)
        cvctx.fillText('Health: ' + currPlayer.health, 120, 1070)
        // Manip end

        // File fuckery
        const filename = Math.floor(new Date() / 1000) + '-tmp.png'
        const out = fs.createWriteStream(path.resolve('tmp', filename))
        const stream = canvas.createPNGStream()
        stream.pipe(out)
        out.on('finish', () => {
          ctx.replyWithPhoto({ source: path.resolve('tmp', filename) }, { caption: currPlayer.name }).then(tgctx => {
            fs.unlink(path.resolve('tmp', filename), (err) => {
              if (err) {
                console.error(err)
              }
              // No err == deleted
            })
            base.showMainMenu(ctx)
            leave()
          })
        })
      })
      break
    case 'stats':
      // 2810 x 1400
      const canvas2 = createCanvas(2810, 1400)
      const cvctx2 = canvas2.getContext('2d')
      loadImage(path.join(assetPath, 'stats.png')).then(img => {
        cvctx2.drawImage(img, 0, 0)

        // Image manipulation
        cvctx2.font = '95px Press Start 2P'
        cvctx2.fillStyle = '#382000'

        cvctx2.fillText(currPlayer.armor, 450, 270)
        cvctx2.fillText(currPlayer.initiative, 1550, 270)
        cvctx2.fillText(currPlayer.speed, 2450, 270)

        cvctx2.fillText(currPlayer.baseStats.str, 430, 690)
        cvctx2.fillText(currPlayer.baseStats.dex, 1350, 690)
        cvctx2.fillStyle = '#211200'
        cvctx2.fillText(currPlayer.baseStats.con, 2260, 690)
        cvctx2.fillStyle = '#382000'

        cvctx2.fillText(currPlayer.baseStats.int, 430, 1145)
        cvctx2.fillText(currPlayer.baseStats.wis, 1350, 1145)
        cvctx2.fillText(currPlayer.baseStats.chr, 2260, 1145)
        // Manip end

        // File fuckery
        const filename = Math.floor(new Date() / 1000) + '-tmp.png'
        const out = fs.createWriteStream(path.resolve('tmp', filename))
        const stream = canvas2.createPNGStream()
        stream.pipe(out)
        out.on('finish', () => {
          ctx.replyWithPhoto({ source: path.resolve('tmp', filename) }, { caption: currPlayer.name }).then(tgctx => {
            fs.unlink(path.resolve('tmp', filename), (err) => {
              if (err) {
                console.error(err)
              }
              // No err == deleted
            })
            base.showMainMenu(ctx)
            leave()
          })
        })
      })
      break
    case 'profs':
      // 1440 x 1400
      const canvas3 = createCanvas(1440, 1400)
      const cvctx3 = canvas3.getContext('2d')
      loadImage(path.join(assetPath, 'proficiencies2.png')).then(img => {
        cvctx3.drawImage(img, 0, 0)

        // Image manipulation
        cvctx3.font = '50px Press Start 2P'
        cvctx3.fillStyle = '#382000'

        let displaySkills = []
        console.log(currPlayer.skills)
        for (var skill in currPlayer.skills) {
          if (currPlayer.skills.hasOwnProperty(skill)) {
            if (currPlayer.skills[skill].val && displaySkills.length < 9) {
              displaySkills.push([currPlayer.skills[skill].val, currPlayer.skills[skill].label])
            }
          }
        }
        let height = 130
        displaySkills.map(s => {
          console.log(s)
          cvctx3.fillText(s[0], 120, height)
          cvctx3.fillText(s[1], 220, height)
          height += 150
        })
        // Manip end

        // File fuckery
        const filename = Math.floor(new Date() / 1000) + '-tmp.png'
        const out = fs.createWriteStream(path.resolve('tmp', filename))
        const stream = canvas3.createPNGStream()
        stream.pipe(out)
        out.on('finish', () => {
          ctx.replyWithPhoto({ source: path.resolve('tmp', filename) }, { caption: currPlayer.name }).then(tgctx => {
            fs.unlink(path.resolve('tmp', filename), (err) => {
              if (err) {
                console.error(err)
              }
              // No err == deleted
            })
            base.showMainMenu(ctx)
            leave()
          })
        })
      })
      break
    case 'notes':
      // 2810 x 1400
      const canvas4 = createCanvas(2810, 1400)
      const cvctx4 = canvas4.getContext('2d')
      loadImage(path.join(assetPath, 'notes.png')).then(img => {
        cvctx4.drawImage(img, 0, 0)

        // Image manipulation
        cvctx4.font = '54px Press Start 2P'
        cvctx4.fillStyle = '#382000'

        let words = currPlayer.notepad.split(' ')

        let lineLen = 0
        let lineNr = 1
        let txt = ''
        words.map(word => {
          if (lineNr > 20) {
            return
          }
          if (lineLen + word.length > 35) {
            lineLen = 0
            txt += '\n' + word + ' '
            lineNr++
          } else {
            lineLen += word.length + 1
            txt += word + ' '
          }
        })
        if (lineNr > 20) {
          txt += '...'
        }

        cvctx4.fillText(txt, 160, 200)
        // Manip end

        // File fuckery
        const filename = Math.floor(new Date() / 1000) + '-tmp.png'
        const out = fs.createWriteStream(path.resolve('tmp', filename))
        const stream = canvas4.createPNGStream()
        stream.pipe(out)
        out.on('finish', () => {
          ctx.replyWithPhoto({ source: path.resolve('tmp', filename) }, { caption: currPlayer.name }).then(tgctx => {
            fs.unlink(path.resolve('tmp', filename), (err) => {
              if (err) {
                console.error(err)
              }
              // No err == deleted
            })
            base.showMainMenu(ctx)
            leave()
          })
        })
      })
      break
    default:
      console.error('Display value not found:', match)
  }
})

function formatRace (race) {
  let races = {
    'dragonborn': 'Dragonborn',
    'dwarf': 'Dwarf',
    'elf': 'Elf',
    'gnome': 'Gnome',
    'halfElf': 'Half Elf',
    'halfling': 'Halfling',
    'orc': 'Orc',
    'human': 'Human',
    'tiefling': 'Tiefling'
  }
  return races[race]
}

showPlayerScene.command('cancel', leave())

exports.showPlayerScene = showPlayerScene
