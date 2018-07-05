import Vue from 'vue'

function install(vue, serviceDefineMap) {
  Vue.config.optionMergeStrategies.fetch = function (toVal, fromVal) {
    return async function () {
      if (toVal) toVal.apply(this, arguments)
      if (fromVal) {
        await fromVal.apply(this, arguments)
        if (typeof process !== 'undefined' && process.server)
          nuxtRender.apply(this, arguments)
      }
    }
  }
  const serviceMap = {}
  for (const key in serviceDefineMap) {
    serviceDefineMap.name = key
    serviceMap[key] = createService(serviceDefineMap[key], key)
  }
  Vue.$service = serviceMap
  const mixin = function () {
    if (this.$parent)
      this.$service = this.$parent.$service
    else
      this.$service = Vue.$service
    if (this.$options && this.$options.actions)
      for (const actionName in this.$options.actions) {
        this[actionName] = this.$options.actions[actionName]
      }
    if (this.$options && this.$options.services) {
      for (const name in this.$options.services) {
        const serviceName = this.$options.services[name]
        this[name] = getService(serviceName)
      }
    }
    if (this.$name) {
    } else if (this.$options && this.$options.name) {
      this.$name = this.$options.name
    } else if (this.$vnode) {
      this.$name = this.$vnode.tag
    } else {
      this.$name = ''
    }
  }
  vue.mixin({
    fetch: function () {
      if (this.$parent)
        this.$service = this.$parent.$service
      else
        this.$service = Vue.$service
    },
    beforeCreate: mixin
  })
  for (const key in serviceMap) {
    const service = serviceMap[key]
    if (service.service)
      for (const key2 in service.service) {
        Vue.$service[key][key2] = getService(key2)
        if (devtoolHook)
          Vue.$service[key][key2]._devtoolHook = devtoolHook
      }
  }

  if (Vue.config.devtools) {
    devtoolPlugin(serviceMap)
  }

  if (typeof this.created === 'function')
    this.created(Vue.$service)

  for (const key in serviceMap) {
    let service = serviceMap[key]
    if (service.$$serviceCreated)
      service.$$serviceCreated.apply(service)
  }
}

const devtoolHook =
  typeof window !== 'undefined' &&
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__

function devtoolPlugin(serviceMap) {
  if (devtoolHook) {
    const state = {}
    const getters = {}
    for (const key in serviceMap) {
      const service = serviceMap[key]
      state[key] = service.$data
      for (const computedName in service._computedWatchers) {
        let name = '[C]' + computedName
        if (serviceTempMap.state[key] &&
          serviceTempMap.state[key][computedName]) {
          name += '(' + serviceTempMap.state[key][computedName] + ')'
        }
        Object.defineProperty(state[key], name, {
          get: () => service[computedName],
          enumerable: true
        })
      }
    }
    devtoolHook.emit('vuex:init', {state: state, getters: getters})

    devtoolHook.on('vuex:travel-to-state', (targetState) => {
      const serviceMap = Vue.$service
      for (let stateName in targetState) {
        if (stateName.indexOf('[C]') === 0) continue
        const state = targetState[stateName]
        for (let key in state) {
          const value = state[key]
          serviceMap[stateName][key] = value
        }
      }
    })
  }
}

let actionTempList = []

function devtoolsAction(fn, nameObj) {
  const name = nameObj
  return function (...args) {
    const argsJson = []
    for (let i = 0; i < args.length; i++) {
      argsJson.push(JSON.stringify(args[i]))
    }
    let type = [name.service, name.action].join('.') + '(' +
      [...argsJson].join(',') + ')'
    if (serviceTempMap.action[name.service] &&
      serviceTempMap.action[name.service][name.action]) {
      // name += '(' + serviceTempMap.state[key][computedName] + ')'
      actionTempList.push(type)
    } else {
      actionTempList.push(type)
      if (this) type = '[' + this.$name + ']' + actionTempList.join('->')
      if (devtoolHook) {
        Vue.nextTick(function () {
          devtoolHook.emit('vuex:mutation', {
            type: type,
            payload: args
          }, Vue.$service)
        })
      }
      actionTempList = []
    }
    const returnFn = fn.apply(null, arguments)

    if (returnFn && returnFn.toString() === '[object Promise]') {
      type = 'promise:' + type
    }
    return returnFn
  }
}

function createService(service, serviceName) {
  const option = {
    data: {},
    computed: {}
  }
  if (service.computed)
    option.computed = service.computed
  if (service.state) {
    if (typeof window !== 'undefined' && window.__NUXT__ && window.__NUXT__.service && window.__NUXT__.service[serviceName]) {
      option.data = window.__NUXT__.service[serviceName]
    }
    for (const key in service.state) {
      if (typeof service.state[key] === 'function')
        option.computed[key] = service.state[key]
      else if (!option.data[key])
        option.data[key] = service.state[key]
    }
  }

  if (service.watch)
    option.watch = service.watch
  const _vm = new Vue(option)
  if (service.actions)
    for (const key in service.actions) {
      const actionFn = service.actions[key].bind(_vm)
      _vm[key] = Vue.config.devtools ? devtoolsAction(actionFn, {
        action: key,
        service: serviceName
      }) : actionFn
    }
  if (service.utils)
    _vm.utils = service.utils
  if (service.service)
    _vm.service = service.service
  _vm.$name = serviceName
  if (typeof service.created === 'function')
    _vm.$$serviceCreated = service.created
  return _vm
}

function getService(serviceName) {
  const service = Vue.$service[serviceName]
  if (typeof service === 'undefined')
    console.error('cant find service by name:' + serviceName)
  else
    return service
}

function normalizeMap(map) {
  return Array.isArray(map)
    ? map.map(key => ({key, val: key}))
    : Object.keys(map).map(key => ({key, val: map[key]}))
}

function mapState(serviceName, stateList) {
  const res = {}
  normalizeMap(stateList).forEach(({key, val}) => {
    res[key] = function () {
      return getService(serviceName)[val]
    }
  })
  return res
}

function mapAction(serviceName, stateList) {
  const res = {}
  normalizeMap(stateList).forEach(({key, val}) => {
    res[key] = function (...args) {
      getService(serviceName)[val].call(this, ...args)
    }
  })
  return res
}

function state(serviceName) {
  return function (target, name, descriptor) {
    if (typeof target[name] === 'string') {
      if (typeof target.computed === 'undefined')
        target.computed = {}
      target.computed[name] = function () {
        return getService(serviceName)[descriptor.value]
      }
    } else if (typeof target[name] === 'object') {
      const valueList = target[name]
      if (typeof target.computed === 'undefined')
        target.computed = {}
      target.computed = {
        ...target.computed, ...mapState(serviceName, valueList)
      }
      if (Vue.config.devtools) {
        if (target.name) {
          normalizeMap(valueList).forEach(({key, val}) => {
            setServiceTempState(target.name, key, serviceName + '.' + val)
          })
        }
      }
    }
    delete target[name]
  }
}

const serviceTempMap = {
  state: {},
  action: {}
}

function setServiceTempState(service, key, name) {
  if (typeof serviceTempMap.state[service] === 'undefined') {
    serviceTempMap.state[service] = {}
  }
  serviceTempMap.state[service][key] = name
}

function setServiceTempAction(service, key, name) {
  if (typeof serviceTempMap.action[service] === 'undefined') {
    serviceTempMap.action[service] = {}
  }
  serviceTempMap.action[service][key] = name
}

function action(serviceName) {
  return function (target, name, descriptor) {
    if (typeof target[name] === 'string') {
      if (typeof target.actions === 'undefined')
        target.actions = {}
      target.actions[name] = function (...args) {
        getService(serviceName)[descriptor.value].call(this, ...args)
      }
    } else if (typeof target[name] === 'object') {
      const valueList = target[name]
      if (typeof target.actions === 'undefined')
        target.actions = {}
      target.actions = {...target.actions, ...mapAction(serviceName, valueList)}
      if (Vue.config.devtools) {
        if (target.name) {
          normalizeMap(valueList).forEach(({key, val}) => {
            setServiceTempAction(target.name, key, serviceName + '.' + val)
          })
        }
      }
      console.log(serviceTempMap.action)
    }
    delete target[name]
  }
}

function service(target, name, descriptor) {
  if (typeof target.services === 'undefined')
    target.services = {}
  const serviceName = target[name]
  target.services[name] = serviceName
  // const service = getService(serviceName)
  // target[name] = function(){
  //   return getService(serviceName)
  // }
  // const valueList = target[serviceName]
  // if (typeof target.computed === 'undefined')
  //   target.computed = {}
  // target.computed = {...target.computed, ...mapState(serviceName, valueList)}
}

function nuxtRender(ctx) {
  ctx.beforeNuxtRender(({Components, nuxtState}) => {
    if (Components.length > 0) {
      const component = Components[0]
      if (component.super && component.super.$service) {
        const serviceList = component.super.$service
        const stateList = {}
        for (let serviceName in serviceList) {
          stateList[serviceName] = {}
          const service = serviceList[serviceName]
          const dataMap = service._data
          for (let dataName in dataMap) {
            stateList[serviceName][dataName] = dataMap[dataName]
          }
        }
        nuxtState.service = stateList
      }
    }
  })
}

export {
  action,
  state,
  service,
  mapState,
  mapAction
}
export default {
  install,
  get: getService
}
