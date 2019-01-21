const Scene = require('telegraf/scenes/base')
const Stage = require('telegraf/stage')
const { leave } = Stage

const newPlayerScene = new Scene('newPlayer')
newPlayerScene.enter((ctx) => {
  ctx.replyWithMarkdown('*Creating a new Player*\n\nEnter a name: ')
})
newPlayerScene.leave((ctx) => ctx.reply('Exited setup'))
newPlayerScene.command('cancel', leave())
newPlayerScene.on('text', (ctx) => ctx.reply('Recieved: ' + ctx.message.text))

exports.newPlayerScene = newPlayerScene
