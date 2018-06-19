import _extends from 'babel-runtime/helpers/extends';
import _typeof from 'babel-runtime/helpers/typeof';
import _Object$keys from 'babel-runtime/core-js/object/keys';
import _JSON$stringify from 'babel-runtime/core-js/json/stringify';
import _Object$defineProperty from 'babel-runtime/core-js/object/define-property';
import _regeneratorRuntime from 'babel-runtime/regenerator';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import Vue from 'vue';

function install(vue, serviceDefineMap) {
  Vue.config.optionMergeStrategies.fetch = function (toVal, fromVal, aaa) {
    return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
      var _args = arguments;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (toVal) toVal.apply(this, _args);

              if (!fromVal) {
                _context.next = 5;
                break;
              }

              _context.next = 4;
              return fromVal.apply(this, _args);

            case 4:
              if (typeof process !== 'undefined' && process.server) nuxtRender.apply(this, _args);

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));
  };
  var serviceMap = {};
  for (var key in serviceDefineMap) {
    serviceDefineMap.name = key;
    serviceMap[key] = createService(serviceDefineMap[key], key);
  }
  Vue.$service = serviceMap;
  var mixin = function mixin() {
    if (this.$parent) this.$service = this.$parent.$service;else this.$service = Vue.$service;
    if (this.$options && this.$options.actions) for (var actionName in this.$options.actions) {
      this[actionName] = this.$options.actions[actionName];
    }
    if (this.$options && this.$options.services) {
      for (var name in this.$options.services) {
        var serviceName = this.$options.services[name];
        this[name] = getService(serviceName);
      }
    }
    if (this.$name) {} else if (this.$options && this.$options.name) {
      this.$name = this.$options.name;
    } else if (this.$vnode) {
      this.$name = this.$vnode.tag;
    } else {
      this.$name = '';
    }
  };
  vue.mixin({
    fetch: function fetch() {
      if (this.$parent) this.$service = this.$parent.$service;else this.$service = Vue.$service;
    },
    beforeCreate: mixin
  });
  for (var _key in serviceMap) {
    var _service = serviceMap[_key];
    if (_service.service) for (var key2 in _service.service) {
      Vue.$service[_key][key2] = getService(key2);
      if (devtoolHook) Vue.$service[_key][key2]._devtoolHook = devtoolHook;
    }
  }

  if (Vue.config.devtools) {
    devtoolPlugin(serviceMap);
  }
}

var devtoolHook = typeof window !== 'undefined' && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

function devtoolPlugin(serviceMap) {
  if (devtoolHook) {
    var _state = {};
    var getters = {};

    var _loop = function _loop(key) {
      var service = serviceMap[key];
      _state[key] = service.$data;

      var _loop2 = function _loop2(computedName) {
        var name = '[C]' + computedName;
        if (serviceTempMap.state[key] && serviceTempMap.state[key][computedName]) {
          name += '(' + serviceTempMap.state[key][computedName] + ')';
        }
        _Object$defineProperty(_state[key], name, {
          get: function get() {
            return service[computedName];
          },
          enumerable: true
        });
      };

      for (var computedName in service._computedWatchers) {
        _loop2(computedName);
      }
    };

    for (var key in serviceMap) {
      _loop(key);
    }
    devtoolHook.emit('vuex:init', { state: _state, getters: getters });

    devtoolHook.on('vuex:travel-to-state', function (targetState) {
      var serviceMap = Vue.$service;
      for (var stateName in targetState) {
        if (stateName.indexOf('[C]') === 0) continue;
        var _state2 = targetState[stateName];
        for (var key in _state2) {
          var value = _state2[key];
          serviceMap[stateName][key] = value;
        }
      }
    });
  }
}

var actionTempList = [];

function devtoolsAction(fn, nameObj) {
  var name = nameObj;
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key2 = 0; _key2 < _len; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var argsJson = [];
    for (var i = 0; i < args.length; i++) {
      argsJson.push(_JSON$stringify(args[i]));
    }
    var type = [name.service, name.action].join('.') + '(' + [].concat(argsJson).join(',') + ')';
    if (serviceTempMap.action[name.service] && serviceTempMap.action[name.service][name.action]) {
      // name += '(' + serviceTempMap.state[key][computedName] + ')'
      actionTempList.push(type);
    } else {
      actionTempList.push(type);
      if (this) type = '[' + this.$name + ']' + actionTempList.join('->');
      if (devtoolHook) {
        Vue.nextTick(function () {
          devtoolHook.emit('vuex:mutation', {
            type: type,
            payload: args
          }, Vue.$service);
        });
      }
      actionTempList = [];
    }
    var returnFn = fn.apply(null, arguments);

    if (returnFn && returnFn.toString() === '[object Promise]') {
      type = 'promise:' + type;
    }
    return returnFn;
  };
}

function createService(service, serviceName) {
  var option = {
    data: {},
    computed: {}
  };
  if (service.computed) option.computed = service.computed;
  if (service.state) {
    if (typeof window !== 'undefined' && window.__NUXT__ && window.__NUXT__.service && window.__NUXT__.service[serviceName]) {
      option.data = window.__NUXT__.service[serviceName];
    }
    for (var key in service.state) {
      if (typeof service.state[key] === 'function') option.computed[key] = service.state[key];else if (!option.data[key]) option.data[key] = service.state[key];
    }
  }

  if (service.watch) option.watch = service.watch;
  var _vm = new Vue(option);
  if (service.actions) for (var _key3 in service.actions) {
    var actionFn = service.actions[_key3].bind(_vm);
    _vm[_key3] = Vue.config.devtools ? devtoolsAction(actionFn, {
      action: _key3,
      service: serviceName
    }) : actionFn;
  }
  if (service.utils) _vm.utils = service.utils;
  if (service.service) _vm.service = service.service;
  _vm.$name = serviceName;
  return _vm;
}

function getService(serviceName) {
  var service = Vue.$service[serviceName];
  if (typeof service === 'undefined') console.error('cant find service by name:' + serviceName);else return service;
}

function normalizeMap(map) {
  return Array.isArray(map) ? map.map(function (key) {
    return { key: key, val: key };
  }) : _Object$keys(map).map(function (key) {
    return { key: key, val: map[key] };
  });
}

function mapState(serviceName, stateList) {
  var res = {};
  normalizeMap(stateList).forEach(function (_ref2) {
    var key = _ref2.key,
        val = _ref2.val;

    res[key] = function () {
      return getService(serviceName)[val];
    };
  });
  return res;
}

function mapAction(serviceName, stateList) {
  var res = {};
  normalizeMap(stateList).forEach(function (_ref3) {
    var key = _ref3.key,
        val = _ref3.val;

    res[key] = function () {
      var _getService$val;

      for (var _len2 = arguments.length, args = Array(_len2), _key4 = 0; _key4 < _len2; _key4++) {
        args[_key4] = arguments[_key4];
      }

      (_getService$val = getService(serviceName)[val]).call.apply(_getService$val, [this].concat(args));
    };
  });
  return res;
}

function state(serviceName) {
  return function (target, name, descriptor) {
    if (typeof target[name] === 'string') {
      if (typeof target.computed === 'undefined') target.computed = {};
      target.computed[name] = function () {
        return getService(serviceName)[descriptor.value];
      };
    } else if (_typeof(target[name]) === 'object') {
      var valueList = target[name];
      if (typeof target.computed === 'undefined') target.computed = {};
      target.computed = _extends({}, target.computed, mapState(serviceName, valueList));
      if (Vue.config.devtools) {
        if (target.name) {
          normalizeMap(valueList).forEach(function (_ref4) {
            var key = _ref4.key,
                val = _ref4.val;

            setServiceTempState(target.name, key, serviceName + '.' + val);
          });
        }
      }
    }
    delete target[name];
  };
}

var serviceTempMap = {
  state: {},
  action: {}
};

function setServiceTempState(service, key, name) {
  if (typeof serviceTempMap.state[service] === 'undefined') {
    serviceTempMap.state[service] = {};
  }
  serviceTempMap.state[service][key] = name;
}

function setServiceTempAction(service, key, name) {
  if (typeof serviceTempMap.action[service] === 'undefined') {
    serviceTempMap.action[service] = {};
  }
  serviceTempMap.action[service][key] = name;
}

function action(serviceName) {
  return function (target, name, descriptor) {
    if (typeof target[name] === 'string') {
      if (typeof target.actions === 'undefined') target.actions = {};
      target.actions[name] = function () {
        var _getService$descripto;

        for (var _len3 = arguments.length, args = Array(_len3), _key5 = 0; _key5 < _len3; _key5++) {
          args[_key5] = arguments[_key5];
        }

        (_getService$descripto = getService(serviceName)[descriptor.value]).call.apply(_getService$descripto, [this].concat(args));
      };
    } else if (_typeof(target[name]) === 'object') {
      var valueList = target[name];
      if (typeof target.actions === 'undefined') target.actions = {};
      target.actions = _extends({}, target.actions, mapAction(serviceName, valueList));
      if (Vue.config.devtools) {
        if (target.name) {
          normalizeMap(valueList).forEach(function (_ref5) {
            var key = _ref5.key,
                val = _ref5.val;

            setServiceTempAction(target.name, key, serviceName + '.' + val);
          });
        }
      }
      console.log(serviceTempMap.action);
    }
    delete target[name];
  };
}

function service(target, name, descriptor) {
  if (typeof target.services === 'undefined') target.services = {};
  var serviceName = target[name];
  target.services[name] = serviceName;
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
  ctx.beforeNuxtRender(function (_ref6) {
    var Components = _ref6.Components,
        nuxtState = _ref6.nuxtState;

    if (Components.length > 0) {
      var component = Components[0];
      if (component.super && component.super.$service) {
        var serviceList = component.super.$service;
        var stateList = {};
        for (var serviceName in serviceList) {
          stateList[serviceName] = {};
          var _service2 = serviceList[serviceName];
          var dataMap = _service2._data;
          for (var dataName in dataMap) {
            stateList[serviceName][dataName] = dataMap[dataName];
          }
        }
        nuxtState.service = stateList;
      }
    }
  });
}

export { action, state, service, mapState, mapAction, nuxtRender };
export default {
  install: install,
  get: getService
};