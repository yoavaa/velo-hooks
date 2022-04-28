Velo Hooks
---


The Velo Hooks provide *state management* for Velo based on the concepts of hooks from [solid.js](https://www.solidjs.com/).

In a nutshell, Velo Hooks are

```js

import {bind, createState} from 'velo-hooks';

bind($w, refs => {
  let [text, setText] = createState('hello world');
  
  refs.text1.text = text;
})
```

in the above code, `text` and `setText` are state getter and setters, which ensure on the state update, any user of the state is also updated.
                                                                                            
**Some important differences from React**
1. Unlike React, **`text` is a function** and reading the state value is a function call `text()`
2. `refs.text1.text` is updated automatically on the text state change

Let's dig into another example - a counter

```js
import {bind, createState, createEffect, createMemo, bindShowHide} from 'velo-hooks';

bind($w, refs => {
  let [counter, setCounter] = createState(30);
  let formattedCounter = createMemo(() => `${counter()}`);
  let tens = createMemo(() => `${Math.floor(counter()/10)}`);
  let step = createMemo(() => Math.abs(counter()) >= 10 ? 5 : 1)
  createEffect(() => {
    console.log(tens())
  })

  refs.counter.text = formattedCounter;
  refs.increment.onClick = () => setCounter(counter() + step())
  refs.decrement.onClick = () => setCounter(_ => _ - step())
  refs.counterExtraView.text = formattedCounter
  refs.box1.backgroundColor = createMemo(() => counter() % 2 === 0 ? `blue` : 'red')
  bindShowHide(
    refs.counterExtraView, 
    createMemo(() => counter() > 10),
    {
      hideAnimation: {effectName: "fade", effectOptions: {duration: 2000, delay: 1000}},
      showAnimation: {effectName: "spin", effectOptions: {duration: 1000, delay: 200, direction: 'ccw'}}
    }
  )
})
```

In the above example we see the use of multiple hooks and binds
* `createState` is used to create the counter state
* `createMemo` are used to create derived (or computed state). note that unlike React useEffect, we do not need to specify the dependencies
* `createEffect` is used to print to the console any time the `tens` derives state changes.
* `onClick` events are bound to functions who update the `counter` state 
* `bindShowHide` is used to bind the `hidden` property, `show` and `hide` functions to a state and to animations. Alternatively, we could have used `createEffect` for the same result, if a bit more verbose code.

* Reference

## createState
