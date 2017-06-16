'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// Copyright (c) 2017 by Igor Tkachenko <vash.igor@gmail.com>. All Rights Reserved.
// This code is provided under the MIT license.
// You can find the full text in the package you get this file with.

/* eslint-disable import/no-extraneous-dependencies */

/* eslint-enable import/no-extraneous-dependencies */

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.assign');

var _lodash4 = _interopRequireDefault(_lodash3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Helper functions.
 */


/**
 * Types that are used in the module.
 */
var metadata = {};
function castMetadata(self, options) {
  /* eslint-disable no-underscore-dangle */
  if (options.metadata) {
    if (!metadata[self._uid]) {
      metadata[self._uid] = _extends({}, options.metadata);
    }

    return { metadata: metadata[self._uid] };
  }
  /* eslint-enable no-underscore-dangle */

  return {};
}

function destroyMetadata(self, options) {
  /* eslint-disable no-underscore-dangle */
  if (options.metadata && metadata[self._uid]) {
    delete metadata[self._uid];
  }
  /* eslint-enable no-underscore-dangle */
}

/**
 * Module export.
 * Wrap function that simplifies HOC creation for VueJs.
 * It can be used to transform a render function in a fullscale component.
 */

exports.default = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return function (com) {
    var mixins = options.options && options.options.mixins ? options.options.mixins : [];

    // We can transform some function to component instead of wrapping one.
    if (!(com.name || com.options)) {
      return _vue2.default.extend(_extends({}, (0, _lodash2.default)(options, 'options', {}), {

        name: 'great-func-com',

        props: options.props ? options.props : {},

        mixins: [].concat(_toConsumableArray(mixins), [{
          destroyed: function destroyed() {
            destroyMetadata(this, options);
          }
        }]),

        render: function render(h) {
          return com(h, _extends({
            props: this.$props,
            children: this.$children,
            self: this
          }, castMetadata(this, options)));
        }
      }));
    }

    // This is a dangerous dirty hack - we change props option of the decorated component.
    com.options.props = com.options.props || {};
    (0, _lodash4.default)(com.options.props, (0, _lodash2.default)(options, 'props', {}));

    return _vue2.default.extend(_extends({}, (0, _lodash2.default)(options, 'options', {}), {

      name: 'great-hoc',

      props: com.options.props,

      mixins: [].concat(_toConsumableArray(mixins), [{
        created: function created() {
          this.$hocMetadata = castMetadata(this, options).metadata;
        },
        destroyed: function destroyed() {
          destroyMetadata(this, options);
        }
      }]),

      render: function render(h) {
        var metadata = castMetadata(this, options).metadata || {};

        // Generete prop value
        var props = options.injectProps ? options.injectProps(this.$props, this, options, metadata) : this.$props;

        // Prepare component render data
        var prepare = options.prepareData || options.preapreData;
        var others = prepare ? prepare(this, options) : {};

        var payload = {
          com: com,
          props: props,
          children: this.$children,
          self: this,
          others: others,
          metadata: metadata
        };
        if (options.render) {
          return options.render(h, payload);
        }

        return h(com, _extends({ props: props }, others), this.$children);
      }
    }));
  };
};
