# Vue JS HOC helper
Basic HOC that allows Vue js behave a more React way.

**Table of Contents**

- [Vue JS HOC helper](#)
	- [Motivation](#motivation)
	- [Limitations](#limitations)
	- [Installation](#installation)
	- [Usage](#usage)
	- [Features](#features)
	- [Related Libraries](#relatedlibraries)
	- [API](#api)
		- [hoc-helper](#hoc-helper)
		- [Options](#options)
		- [RenderPayload](#renderpayload)
		- [RenderFunction (deprecated)](#renderfunction)
		- [Utility Functions](#utility-functions)
			- [Cast component's metadata](#castmetadata)
			- [Destroy component's metadata](#destroymetadata)
	- [Examples](#examples)
		- [HOC that injects prop and its value](#hoc-that-injects-prop-and-its-value)
		- [HOC that injects some complex behavior](#hoc-that-injects-some-complex-behavior)
	- [License](#license)

---
## Motivation
I see VueJs as a great library because it managed to combine multiple paradigms
and approaches, that makes it ideal tool for experiments and studies.
On the other hand I see ReactJs as the best library for production projects,
because it provides consistent, simple one-path-fits-all aproach for the project.

Thus, because I need to use VueJs in production, I'd like to make it behave more
React way in my hands.
Also I can't stand the temptation to use vuejs' great capabilities to experiment
and learn.

## Limitations
This library is mostly useful when you use:
* vuejs with render functions
* es6 modules to structure your porject

## Installation

```bash
npm install --save great-vue-hoc-helper
# or
yarn add great-vue-hoc-helper
```

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
```


## Features
* Allows to pass props from HOC to a wappred component without explicit declaration of them in the wrapped component.
* Allows to use a single render function as a whole component.
This is deprecated. Please use [this module](https://github.com/vashigor/great-vue-func-com)
* Allows inject props' values into the wrapped components easially.
* Allows to store some metadata, or data, or even functionality alongside the component instance without making vue js know about it.

## Related Libraries
* [Functional components createion](https://github.com/vashigor/great-vue-func-com)

## API
### hoc-helper
Signature of default import (helper itself)
```javascript
(options: Options = {}) => (com: typeof Vue | RenderFunction) => typeof Vue
```

If you use metadata object, it is accessible in the HOC methods as `this.$hocMetadata`.

### Options
```javascript
interface Options {
	// Inject props values into the child component
  injectProps?: (props: T, self?: Vue, options?: Options<T>, metadata?: any) => T,
  // Prepare vue vm render data object
  prepareData?: (self: Vue, options?: Options<T>) => any,
  // Additional props definitions
  props?: T,
  // If you want to render decorator rendere youself, you can use this property
  render?: (h: any, payload?: RenderPayload<T>) => any,
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
interface RenderPayload<T> {
  com?: typeof Vue,
  self: Vue,
  props: T,
  others?: any,
  children: Vue[],
  metadata?: any,
}
```

### RenderFunction
```javascript
/**
 * @deprectated please use this module instead https://github.com/vashigor/great-vue-func-com
 */
type RenderFunction = (h: any, payload?: RenderPayload) => any
```

### Utility Functions

#### castMetadata
```javascript
function castMetadata<T>(self: Vue, options: Options<T>): { metadata: Object<Metadata> }
```
This function return metadata object for particular component intstance.
It uses its uid to identify it. It should be component itself, if it's wrapped by HOC it won't work.

### destroyMetadata
```javascript
function destroyMetadata(self: Vue): void
```
This function destroys metadata object of a particular component instance.


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

## License
This module is provided under the MIT License. You have to read LICENSE.md file for details.

---
Copyright (c) 2017 by Igor Tkachenko <vash.igor@gmail.com>. All Rights Reserved.
