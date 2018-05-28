<template>
  <div>
    Value: {{ count }}
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
    <button @click="incrementIfOdd">Increment if odd</button>
    <button @click="incrementAsync">Increment async</button>
    <div>
      <div>Recent History (last 5 entries): {{ recentHistory }}</div>
    </div>
  </div>
</template>

<script>
  import {action, state} from 'vuexs'

  export default {
    name: 'Counter',

    @state('counterService')
    'counterServiceStates': {
      count: 'count',
      recentHistory: 'recentHistory'
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
