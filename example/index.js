// Copyright (c) 2017 by Igor Tkachenko <vash.igor@gmail.com>. All Rights Reserved.
// This code is provided under the MIT license.
// You can find the full text in the package you get this file with.

import compose from 'lodash.flowright'; // eslint-disable-line import/no-extraneous-dependencies

import Vue from 'vue'; // eslint-disable-line import/no-extraneous-dependencies


import combine from '../module/index';

/**
 * This decorator injects property and it's value into the compenent instance
 * You don't need to declare this property into wrapped component.
 */
const Injector = value => combine({
  injectProps: props => ({ ...props, value }),
});

/**
 * This decorator increments property value and rerender the component when this
 * happens. But it rerenders the component only on even values of the increment.
 * Actually this is an example of shouldComponentUpdate-like behaviour.
 */
const Incrementor = () => combine({
  props: { value: {} },

  metadata: {
    addedValue: null,
    cached: null,
  },

  render: (h, { com: Com, self, props, metadata }) => {
    const { addedValue, cached } = metadata;
    if (addedValue === null) {
      /* eslint-disable no-param-reassign */
      metadata.addedValue = 0;
      setInterval(() => {
        console.log('tick', metadata.addedValue += 1);
        self.$forceUpdate();
      }, 2000);
      /* eslint-enable no-param-reassign */
    }

    // We do not rerender the wrapped component if the added value is odd.
    if (cached && (addedValue % 2 === 1)) {
      return cached;
    }

    const newProps = { ...props, value: props.value + addedValue };

    /* eslint-disable no-param-reassign */
    metadata.cached = <Com {...{ props: newProps }}>{self.$children}</Com>;
    /* eslint-enable no-param-reassign */
    return metadata.cached;
  },
});


/**
 * Declare our component and wrap it with HOCs.
 */
const MyComp = compose(
  // Set the initial value of property value to 3.
  Injector(3),
  // Increment the value property every 2 seconds.
  Incrementor(),
)(
  Vue.component({
    render(h) {
      return <div>{this.value}</div>;
    },
  }),
);

/* eslint-disable no-new */
new Vue({ el: '#example-app', render: h => h('div', {}, [h(MyComp), h(MyComp)]) });
/* eslint-enable no-new */
