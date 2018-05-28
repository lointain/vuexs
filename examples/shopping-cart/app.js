import 'babel-polyfill'
import Vue from 'vue'
import App from './components/App.vue'
import Vuexs from 'vuexs'
import services from './services'
import {currency} from './currency'

Vue.use(Vuexs, services)
Vue.filter('currency', currency)

new Vue({
  el: '#app',
  render: h => h(App)
})
