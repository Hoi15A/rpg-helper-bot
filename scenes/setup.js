const Scene = require('telegraf/scenes/base')
const Stage = require('telegraf/stage')
const { leave } = Stage

const setupScene = new Scene('setup')
setupScene.enter((ctx) => ctx.replyWithMarkdown('Started setup. This needs to be a keeb.\n `/cancel` to leave'))
setupScene.leave((ctx) => ctx.reply('Exited setup'))
setupScene.command('cancel', leave())
setupScene.on('text', (ctx) => ctx.reply('Recieved: ' + ctx.message.text))

exports.setupScene = setupScene
