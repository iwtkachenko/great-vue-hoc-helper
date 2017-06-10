# Vue JS HOC helper
Basic HOC that allows Vue js behave a more React way.

**Table of Contents**

- [Vue JS HOC helper](#)
	- [Motivation](#)
	- [Limitations](#)
	- [Installation](#)
	- [Usage](#)
	- [Features](#)
	- [API](#)
		- [hoc-helper](#)
		- [Options](#)
		- [RenderPayload](#)
		- [RenderFunction](#)
	- [Examples](#)
		- [HOC that injects prop and its value](#)
		- [HOC that injects some complex behavior](#)
		- [Make a component from a function](#)

---
## Motivation
My tasks are related to writing complicated visual components, which potentially have complicated relationships with one another. E.g. composable interfaces of product purchase that heavily implies polimorfism of some parts of the interface based on the product type and state.  
Also I'm responsible for reliablity and performance of all these things.  
I need to make code simple and have things under full control.

Because I face vue js in production for some project I need to vuejs for mentioned purposes, so I decided to make it behave a more React way.

## Limitations
This library is mostly useful when you use:
* vuejs with render functions
* es6 modules to structure your porject 

## Installation

## Usage
```javascript
import Vue from 'vue';
import compose from 'lodash.flowright';
import helper from 'great-vue-hoc-helper';
import Component from 'vue-class-component'; 

// Create HOC
const Hoc = value => helper({
  props: { value: {} },
  injectProps: props => ({ ...props, value }),
})

// Compose your component
const MyComp = compose(
 Hoc(3),
 Component(),
)(class extends Vue {
  render(h) {
    return <div>{this.value}</div>;
  }
});

// Create a function component
const FuncComp = helper({ props: { value: {} } })(
  // We still can't use arrow body for vue's jsx.
  (h, { self }) => { return <div>{self.value}</div>; },
)
```


## Features
* Allows to pass props from HOC to a wappred component without explicit declaration of them in the wrapped component.
* Allows to use a single render function as a whole component.
* Allows to use a single render function as a full-scale component.
* Allows inject props' values into the wrapped components easially.
* Allows to store some metadata, or data, or even functionality alongside the component instance without making vue js know about it.

## API
### hoc-helper
Signature of default import (helper itself)
```javascript 
(options: Options = {}) => (com: typeof Vue | RenderFunction) => typeof Vue 
```

### Options
```javascript
interface Options {
  // Inject props values into the child component
  injectProps?: (props: any, self?: any, options?: Options, metadata?: any) => any,
  // Prepare vue vm render data object
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
```

### RenderPayload
```javascript
interface RenderPayload {
  com?: typeof Vue,
  self: any,
  props: any,
  others?: any,
  children: any[],
  metadata?: any,
}
```

### RenderFunction
```javascript
type RenderFunction = (h: any, payload?: RenderPayload) => any
```

## Examples
### HOC that injects prop and its value
```javascript
const Injector = value => combine({
  props: { value: {} },
  injectProps: props => ({ ...props, value }),
});

const MyComponent = compose(Injector(4), Component())(class extends Vue {
  render(h) {
    reutrn <div>{this.value}</div>;
  }
});
```

### HOC that injects some complex behavior
```javascript
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
 * Notice that the component is just a function.
 */
const MyComp = compose(
  // Set the initial value of property value to 3.
  Injector(3),
  // Increment the value property every 2 seconds.
  Incrementor(),
  Component())(
  class extends Vue {
    render(h) { 
      return <div>{this.value}</div>; 
    }
  }
);
```

### Make a component from a function
```javascript
const MyComp = combine({ props: { value: {} } })(
  // We still can't use arrow body for vue's jsx.
  (h, { self }) => { return <div>{self.value}</div>; },
)
```

---
Copyright (c) 2017 by Igor Tkachenko <vash.igor@gmail.com>. All Rights Reserved.
