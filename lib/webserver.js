const fastifyApp = require('fastify')()

module.exports = {
  startWebhook: function (bot, path, port) {
    fastifyApp.use(bot.webhookCallback(path))
    fastifyApp.listen(port, () => {
      console.log('Webserver listening on', port)
    })
  }
}
