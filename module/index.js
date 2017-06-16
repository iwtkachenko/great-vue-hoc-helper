// @flow

// Copyright (c) 2017 by Igor Tkachenko <vash.igor@gmail.com>. All Rights Reserved.
// This code is provided under the MIT license.
// You can find the full text in the package you get this file with.

/* eslint-disable import/no-extraneous-dependencies */
import Vue from 'vue';
/* eslint-enable import/no-extraneous-dependencies */

import get from 'lodash.get';
import assign from 'lodash.assign';

/**
 * Types that are used in the module.
 */
export interface RenderPayload {
  com?: typeof Vue,
  self: any,
  props: any,
  others?: any,
  children: any[],
  metadata?: any,
}

export interface Options {
  // Inject props values into the child component
  injectProps?: (props: any, self?: any, options?: Options, metadata?: any) => any,
  // Prepare vue vm render data object
  prepareData?: (self: any, options?: Options) => any,
  /**
   * This property was missnamed and its support can be removed any time
   * @deprecated
   */
  preapreData?: (self: any, options?: Options) => any,
  // Additional props definitions
  props?: any,
  // If you want to render decorator rendere youself, you can use this property
  render?: (h: any, payload?: RenderPayload) => any,
  // This object has to have shape of Vue component options
  options?: any,
  /**
   * Initial values for unbinded data for vnode instance.
   * The idea is that all vue data object (with props, data, methods etc.)
   * is under tight control by things like proxies, observers, watchers,
   * and any other things that can influnce or react on your values some way or
   * prevent you from operating it the way you want.
   * This is a safe place to keep some data that relates to your HOC.
   */
  metadata?: any,
}

export type RenderFunction = (h: any, payload?: RenderPayload) => any

/**
 * Helper functions.
 */
const metadata = {};
function castMetadata(self: any, options: Options): any {
  /* eslint-disable no-underscore-dangle */
  if (options.metadata) {
    if (!metadata[self._uid]) {
      metadata[self._uid] = { ...options.metadata };
    }

    return { metadata: metadata[self._uid] };
  }
  /* eslint-enable no-underscore-dangle */

  return {};
}

function destroyMetadata(self: any, options: Options) {
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
export default (options: Options = {}) => (com: typeof Vue | RenderFunction) => {
  const mixins = options.options && options.options.mixins ? options.options.mixins : []

  // We can transform some function to component instead of wrapping one.
  if (!(com.name || com.options)) {
    return Vue.extend({
      ...get(options, 'options', {}),

      name: 'great-func-com',

      props: options.props ? options.props : {},

      mixins: [...mixins, {
        destroyed() {
          destroyMetadata(this, options);
        }
      }],

      render(h) {
        return com(h, {
          props: this.$props,
          children: this.$children,
          self: this,
          ...castMetadata(this, options),
        });
      }
    });
  }

  // This is a dangerous dirty hack - we change props option of the decorated component.
  com.options.props = com.options.props || {};
  assign(com.options.props, get(options, 'props', {}));

  return Vue.extend({
    ...get(options, 'options', {}),

    name: 'great-hoc',

    props: com.options.props,

    mixins: [...mixins, {
      created() {
        this.$hocMetadata = castMetadata(this, options).metadata;
      },

      destroyed() {
        destroyMetadata(this, options);
      }
    }],

    render(h) {
      const metadata = castMetadata(this, options).metadata || {};

      // Generete prop value
      const props = options.injectProps
        ? options.injectProps(this.$props, this, options, metadata)
        : this.$props;

      // Prepare component render data
      const prepare = options.prepareData || options.preapreData
      const others = prepare ? prepare(this, options) : {};

      const payload = {
        com,
        props,
        children: this.$children,
        self: this,
        others,
        metadata,
      };
      if (options.render) {
        return options.render(h, payload);
      }

      return h(com, { props, ...others }, this.$children);
    }
  });
};
