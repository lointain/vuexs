import Vue from 'vue'
import Counter from './Counter.vue'
import Vuexs from 'vuexs'
import services from './services'

Vue.use(Vuexs, services)

new Vue({
  el: '#app',
  render: h => h(Counter)
})
