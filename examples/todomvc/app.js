import 'babel-polyfill'
import Vue from 'vue'
import Vuexs from 'vuexs'
import services from './services'
import App from './components/App.vue'

Vue.use(Vuexs, services)

new Vue({
  el: '#app',
  render: h => h(App)
})
