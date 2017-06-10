'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var _vueClassComponent = require('vue-class-component');

var _vueClassComponent2 = _interopRequireDefault(_vueClassComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
    // We can transform some function to component instead of wrapping one.
    if (!(com.name || com.options)) {
      return (0, _vueClassComponent2.default)(_extends({}, (0, _lodash2.default)(options, 'options', {}), {
        name: 'great-func-com',
        props: options.props ? options.props : {}
      }))(function (_Vue) {
        _inherits(_class, _Vue);

        function _class() {
          _classCallCheck(this, _class);

          return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
        }

        _createClass(_class, [{
          key: 'destroyed',

          // @TODO If we already have destroyed hook declared, this can create some issue.
          value: function destroyed() {
            destroyMetadata(this, options);
          }
        }, {
          key: 'render',
          value: function render(h) {
            return com(h, _extends({
              props: this.$props,
              children: this.$children,
              self: this
            }, castMetadata(this, options)));
          }
        }]);

        return _class;
      }(_vue2.default));
    }

    // This is dangerous dirty hack - we change props option of the decorated component.
    /* eslint-disable no-param-reassign */
    com.options.props = _extends({}, com.options.props, (0, _lodash2.default)(options, 'props', {}));
    /* eslint-enable no-param-reassign */
    return (0, _vueClassComponent2.default)(_extends({}, (0, _lodash2.default)(options, 'options', {}), {
      name: 'great-hoc',
      props: com.options.props
    }))(function (_Vue2) {
      _inherits(_class2, _Vue2);

      function _class2() {
        _classCallCheck(this, _class2);

        return _possibleConstructorReturn(this, (_class2.__proto__ || Object.getPrototypeOf(_class2)).apply(this, arguments));
      }

      _createClass(_class2, [{
        key: 'destroyed',

        // @TODO If we already have destroyed hook declared, this can create some issue.
        value: function destroyed() {
          destroyMetadata(this, options);
        }
      }, {
        key: 'render',
        value: function render(h) {
          // Generete prop value
          var props = options.injectProps ? options.injectProps(this.$props, this, options, metadata) : this.$props;

          // Prepare component render data
          var others = options.preapreData ? options.preapreData(this, options) : {};

          var payload = _extends({
            com: com,
            props: props,
            children: this.$children,
            self: this,
            others: others
          }, castMetadata(this, options));
          if (options.render) {
            return options.render(h, payload);
          }

          return h(com, _extends({ props: props }, others), this.$children);
        }
      }]);

      return _class2;
    }(_vue2.default));
  };
};
