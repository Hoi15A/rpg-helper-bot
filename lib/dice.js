module.exports = {
  roll: function (type, amount, sides) {
    let rolls = []
    switch (type) {
      case 'standard':
        if (typeof sides !== 'number') {
          sides = parseInt(sides)
        }
        for (let i = 0; i < amount; i++) {
          rolls.push(getRandomNumberInRange(1, sides))
        }
        break
      case 'percentile':
        for (let i = 0; i < amount; i++) {
          rolls.push(getRandomNumberInRange(0, 9) * 10)
        }
        break
      default:
        console.error('Roll type', type, 'is not defined')
    }
    return rolls
  }
}

function getRandomNumberInRange (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  let rng = Math.floor(Math.random() * (max - min + 1)) + min
  return rng
}
