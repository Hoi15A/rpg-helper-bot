const fastifyApp = require('fastify')()

module.exports = {
  startWebhook: function (bot, path, port) {
    fastifyApp.use(bot.webhookCallback(path))
    fastifyApp.listen(port, '0.0.0.0', () => {
      console.log('Webserver listening on', port)
    })
  }
}
