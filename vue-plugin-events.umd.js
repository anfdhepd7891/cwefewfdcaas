/**
 * vue-plugin-events
 * https://github.com/nolde/vue-plugin-events
 *
 * Copyright (c) 2019 Ricardo Nolde <ricardo@nolde.com.br>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.VuePluginEvents = {}));
}(this, (function (exports) { 'use strict';

  var VueEventBus = function VueEventBus (Vue) {
    this._bus = new Vue();
  };

  VueEventBus.prototype.emit = function emit (event) {
      var ref;

      var args = [], len = arguments.length - 1;
      while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];
    (ref = this._bus).$emit.apply(ref, [ event ].concat( args ));
  };

  VueEventBus.prototype.on = function on (event, callback) {
    this._bus.$on(event, callback);
  };

  VueEventBus.prototype.once = function once (event, callback) {
    this._bus.$once(event, callback);
  };

  VueEventBus.prototype.off = function off (event, callback) {
    if (event && callback) {
      this._bus.$off(event, callback);
    } else {
      console.warn("[vue-plugin-events] \"$events.off\" can only be used with event and callback");
    }
  };

  var VueEventsMixin = {
    data: function data () {
      var events = this.$options.events;
      if (events) {
        this._eventTracker = {};
      }
      return {}
    },
    created: function created () {
      var this$1 = this;

      var events = this.$options.events;
      if (events && this._eventTracker) {
        Object.keys(events).forEach(function (name) { return setupHandler(this$1, name, events[name]); });
      }
    },
    beforeDestroy: function beforeDestroy () {
      var this$1 = this;

      if (this._eventTracker) {
        Object.keys(this._eventTracker).forEach(function (name) {
          this$1.$events.off(name, this$1._eventTracker[name]);
          this$1.$delete(this$1._eventTracker, name);
        });
      }
    }
  };

  // //////////////////////////////////////////////

  function setupHandler (vm, name, handler) {
    switch (typeof handler) {
      case 'function': {
        setupFunction(vm, name, handler, 'on');
        break
      }
      case 'string': {
        setupString(vm, name, handler, 'on');
        break
      }
      case 'object': {
        setupObject(vm, name, handler);
        break
      }
      default: {
        console.warn(("[vue-plugin-events] Event handler \"" + name + "\" is invalid."));
        break
      }
    }
  }

  function setupFunction (vm, name, handler, busMethod) {
    var callback = handler.bind(vm);
    vm._eventTracker[name] = callback;
    vm.$events[busMethod](name, callback);
    return callback
  }

  function setupString (vm, name, handler, busMethod) {
    if (!vm[handler]) {
      console.warn(("[vue-plugin-events] Event handler \"" + name + "\" is set to inexistent method \"" + handler + "\"."));
      return null
    }
    var callback = vm[handler].bind(vm);
    vm._eventTracker[name] = callback;
    vm.$events[busMethod](name, callback);
    return callback
  }

  function setupOptionsHandler (vm, name, handler, once) {
    switch (typeof handler) {
      case 'function': {
        return setupFunction(vm, name, handler, (once && 'once') || 'on')
      }
      case 'string': {
        return setupString(vm, name, handler, (once && 'once') || 'on')
      }
      default: {
        console.warn(("[vue-plugin-events] Event handler \"" + name + "\" is invalid."));
        return null
      }
    }
  }

  function setupObject (vm, name, options) {
    if (options.handler) {
      var callback = setupOptionsHandler(vm, name, options.handler, Boolean(options.once));
      if (callback && options.immediate) {
        callback();
      }
      return callback
    }
    console.warn(("[vue-plugin-events] Event handler \"" + name + "\" is invalid (no handler found)."));
  }

  var VueEvents = {
    install: function install (Vue) {
      Vue.prototype.$events = new VueEventBus(Vue);
      Vue.mixin(VueEventsMixin);
    }
  };

  // install by default if using the script tag
  if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(VueEvents);
  }

  var version = '0.0.0-semantic';

  exports.default = VueEvents;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
