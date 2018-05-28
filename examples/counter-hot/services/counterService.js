const limit = 5
export default {
  name: 'counterService',
  state: {
    count: 0,
    history: [],
    recentHistory() {
      const end = this.history.length
      const begin = end - limit < 0 ? 0 : end - limit
      return this.history
        .slice(begin, end)
        .join(', ')
    }
  },
  actions: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    },
    incrementIfOdd() {
      if ((this.count + 1) % 2 === 0) {
        this.increment()
      }
    },
    incrementAsync() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          this.increment()
          resolve()
        }, 1000)
      })
    }
  },
  watch: {
    count(newValue, oldValue) {
      this.history.push(newValue > oldValue ? 'increment' : 'decrement')
    }
  }
}
