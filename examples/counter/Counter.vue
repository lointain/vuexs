<template>
  <div id="app">
    <p>Clicked: {{ count }} times, count is {{ evenOrOdd }}.</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
    <button @click="incrementIfOdd">Increment if odd</button>
    <button @click="incrementAsync">Increment async</button>
  </div>
</template>

<script>
  import {action, state} from 'vuexs'

  export default {
    name: 'Counter',

    @state('counterService')
    'counterServiceStates': {
      count: 'count',
      evenOrOdd: 'evenOrOdd'
    },

    @action('counterService')
    'counterServiceActions': {
      increment: 'increment',
      decrement: 'decrement',
      incrementIfOdd: 'incrementIfOdd',
      incrementAsync: 'incrementAsync',
    },
  }
</script>
