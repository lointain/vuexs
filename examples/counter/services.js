export default {
  'counterService': {
    name: 'counterService',
    state: {
      count: 0,
      evenOrOdd() {
        return this.count % 2 === 0 ? 'even' : 'odd'
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
    }
  }
}
