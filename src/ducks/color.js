export class ColorCache {
  map = {}
  colors = []
  nextColorIndex = 0

  constructor(colors) {
    if (!colors && !Array.isArray(colors))
      throw new Error('colors is required and should be an array')

    this.colors = colors
  }

  getColor(value) {
    let val = this.map[value]

    if (val) {
      return val
    }

    let index = this.getNextColorIndex()
    this.map[value] = this.colors[index]

    return this.map[value]
  }

  getNextColorIndex() {
    if (this.nextColorIndex + 1 === this.colors.length) {
      this.nextColorIndex = 0
      return 0
    }

    return this.nextColorIndex++
  }
}
