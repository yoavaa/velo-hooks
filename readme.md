Velo Hooks
---


The Velo Hooks provide *state management* for Velo based on the concepts of hooks from [solid.js](https://www.solidjs.com/).
                             
Velo Hooks are based on the [Jay Reactive](https://www.npmjs.com/package/jay-reactive) and some underlying API
are exposed.

## Quick Start Example
In a nutshell, Velo Hooks are
```js
import {bind, createState} from 'velo-hooks';

$w.onReady(() => {
   bind($w, refs => {
      let [text, setText] = createState('world');
  
      refs.text1.text = () => `hello ${text()}`;
   })
})
```

In the above code

1. `text` and `setText` are state getter and setters, which ensure on the state update, any user of the state is also updated.
2. `refs.text1.text` is a setter property, which accepts a function. Anytime any dependency of the function changes, the `text1.text` value will be updated. 
   In the above example, when the `text()` state changes, the `refs.text1.text` will be updated.                       

                                                                                            
### Some important differences from React
> 1. Unlike React, **`text` is a function** and reading the state value is a function call `text()`
> 2. `refs.text1.text` is updated automatically on the text state change
> 3. No need to declare hook dependencies like react - dependencies are tracked automatically

## Automatic Batching
          
Velo-Hooks use automatic batching of reactions and updates, such that all the reactions of any state update are computed 
in a single **async** batch. velo-hooks supports forcing **sync** calculation using the reactive `batchReactions` or `flush` APIs.

## Example

Let's dig into another example - a counter

```js
import {bind, createState, createEffect, createMemo, bindShowHide} from 'velo-hooks';

$w.onReady(() => {
   bind($w, refs => {
      let [counter, setCounter] = createState(30);
      let formattedCounter = createMemo(() => `${counter()}`);
      let tens = createMemo(() => `${Math.floor(counter()/10)}`);
      let step = createMemo(() => Math.abs(counter()) >= 10 ? 5 : 1)
      createEffect(() => {
         console.log(tens())
      })

      refs.counter.text = formattedCounter;
      refs.increment.onClick(() => setCounter(counter() + step()))
      refs.decrement.onClick(() => setCounter(_ => _ - step()))
      refs.counterExtraView.text = formattedCounter
      refs.box1.backgroundColor = () => counter() % 2 === 0 ? `blue` : 'red'
      bindShowHide(
              refs.counterExtraView, 
              createMemo(() => counter() > 10),
              {
                 hideAnimation: {effectName: "fade", effectOptions: {duration: 2000, delay: 1000}},
                 showAnimation: {effectName: "spin", effectOptions: {duration: 1000, delay: 200, direction: 'ccw'}}
              }
      )
   })
})
```

In the above example we see the use of multiple hooks and binds
* `createState` is used to create the counter state
* `createMemo` are used to create derived (or computed state). note that unlike React useEffect, we do not need to specify the dependencies
* `createEffect` is used to print to the console any time the `tens` derives state changes.
* `onClick` events are bound to functions who update the `counter` state 
* `bindShowHide` is used to bind the `hidden` property, `show` and `hide` functions to a boolean state and to animations. Alternatively, we could have used `createEffect` for the same result, if a bit more verbose code.
* 
* `bindbindCollapseExpand` is used to bind the `collapsed` property, `expand` and `collapse` functions to a boolean state.
* `bindEnabled` is used to bind the `enabled` property, `enable` and `disable` functions to a boolean state.
* `bindRepeater` is used to bind a repeater `data` property, `onItemReady` and `onItemRemoved` to state management per item

# Reference

* [bind](#bind)
* Hooks
  * [createState](#createState)
  * [createMemo](#createMemo)
  * [createEffect](#createEffect)
  * [mutableObject](#mutableObject)
* Repeaters
   * [bindRepeater](#bindRepeater)
* Special Bindings
  * [bindShowHide](#bindShowHide)
  * [bindCollapseExpand](#bindCollapseExpand)
  * [bindEnabled](#bindEnabled)
* Advanced Computation Control
  * [Reactive](#Reactive)

## <a name="bind">bind</a>

The bind function is the entry point for initiating velo hooks. 
Hooks can only be used within callbacks of bind. 

```typescript
declare function bind<T>($w: $W<T>, fn: (refs: Refs<T>) => void): Reactive
```

The function accepts `$w` parameter and a callback, the callback receives `refs` which is the equivalent of `$w` for hooks. 

The common usage of `bind` is 

```typescript
import {bind, createState} from 'velo-hooks';

$w.onReady(() => {
   bind($w, refs => {
      // ... your hooks logic here
   })
})
```

`bind` returns an instance of [Reactive - see below](#reactive).
**Reactive is used for fine-grained computation control - in most cases the usage of Reactive directly is not needed**

## <a name="createState">createState</a>

Create state is inspired from [solid.js](https://www.solidjs.com/) and [S.js](https://github.com/adamhaile/S),
which is similar and different from React in the sense of using a getter instead of a value.

Examples of those APIs are 
```typescript
import {bind, createState} from 'velo-hooks';

$w.onReady(() => {
   bind($w, refs => {
     // ... state management code goes here
   })
})
```


```typescript
type Next<T> = (t: T) => T 
type Setter<T> = (t: T | Next<T>) => T 
type Getter<T> = () => T 
declare function createState<T>(value: T | Getter<T>): 
    [get: Getter<T>, set: Setter<T>];
```

and it is used as
```typescript
let initialValue = 'some initial value';
const [state, setState] = createState(initialValue);

// read value
state();

// set value
let nextValue = 'some next value';
setState(nextValue);

// set value with a function setter
let next = ' and more';
setState((prev) => prev + next);

// set an element property to track a state
refs.elementId.prop = state;
```

We can also bind the state to a computation, such as change in another state or memo value by using a function as the
`createState` parameter

```typescript
// assuming name is a getter
const [getState, setState] = createState(() => name());
```
this method removes the need to use `createEffect` just in order to update state

## <a name="createEffect">createEffect</a>

createEffect is inspired by React [useEffect](https://reactjs.org/docs/hooks-effect.html) in the sense that it is
run any time any of the dependencies change and can return a cleanup function. Unlike React, the dependencies
are tracked automatically like in Solid.js.

```typescript
type Clean = () => void
declare function createEffect(effect: () => void | cleanup);
```

it can be used for computations, for instance as a timer that ticks every `props.delay()` milisecs.

```typescript
let [time, setTime] = createState(0)
createEffect(() => {
    let timer = setInterval(() => setTime(time => time + props.delay()), props.delay())
    return () => {
        clearInterval(timer);
    }
})
```

## <a name="createMemo">createMemo</a>

createMemo is inspired by Solid.js [createMemo](https://www.solidjs.com/docs/latest/api#creatememo).
It creates a computation that is cached until dependencies change and return a single getter.
For Jay Components memos are super important as they can be used directly to construct the render function
in a very efficient way.

```typescript
type Getter<T> = () => T
declare function createMemo<T>(computation: (prev: T) => T, initialValue?: T);
```

```typescript
let [time, setTime] = createState(0)
let currentTime = createMemo(() => `The current time is ${time()}`)
```

## <a name="mutableObject">mutableObject</a>

`mutableObject` creates a Proxy over an object who tracks modifications to the underlying object,
both for optimization of rendering and for computations. The mutable proxy handles deep objects,
including traversal of arrays and nested objects

```typescript
declare function mutableObject<T>(obj: T): T
```

It is used as

```typescript
// assume todoItems is an array of todo items
let items = mutableObject(inputItems);

// will track this change
items.push({todo: 'abc', done: false});

// will track this change as well
items[3].done = true;
```

mutableObject is very useful for Arrays and repeaters as it allows mutating the items directly

```typescript
import {bind, createState, bindRepeater} from 'velo-hooks';

$w.onReady(() => {
   bind($w, refs => {
      let [items, setItems] = createState(mutableObject([one, two]));
      bindRepeater(refs.repeater, items, (refs, item) => {
         refs.title.text = () => item().title;
         refs.input.onChange((event) => item().done = !item().done)
      })
   })
})
```

mutableObject tracks object immutability by marking objects who have been mutated with two revision marks
```typescript
const REVISION = Symbol('revision');
const CHILDRENREVISION = Symbol('children-revision')
```

When an object is updated, it's `REVISION` is updated to a new larger value.
When a nested object is updated, it's parents `CHILDRENREVISION` is updated to a new larger value.

For instance, for an array, if the array is pushed a new item, it's `REVISION` will increase. If a nested
element of the array is updated, it's `REVISION` increase, while the array's `CHILDRENREVISION` increases.

The markings can be accessed using the symbols
```typescript
items[REVISION]
items[CHILDRENREVISION]
```

## <a name="bindRepeater">bindRepeater</a>

Binds a repeater `data` property, creates a per item reactive for isolated hooks scope and binds the 
`onItemReady` and `onItemRemoved`.
                    
Quick example - using immutable state
       
```typescript
import {bind, createState, bindRepeater} from 'velo-hooks';

$w.onReady(() => {
   bind($w, refs => {
      let [items, setItems] = createState([one, two])
      bindRepeater(refs.repeater, items, (refs, item) => {
         refs.title.text = () => item().title;
         refs.input.onChange((event) => {
            let newItems = [...items()].map(_ => (_._id === item()._id)?({...item(), title: event.target.value}):_);
            setItems(newItems);
         })
      })
   })
})
```

The same example using mutable state
```typescript
import {bind, createState, bindRepeater} from 'velo-hooks';

$w.onReady(() => {
   bind($w, refs => {
      let [items, setItems] = createState(mutableObject([one, two]));
      bindRepeater(refs.repeater, items, (refs, item) => {
         refs.title.text = () => item().title;
         refs.input.onChange((event) => item().tite = event.target.value)
      })
   })
})
```


Formally, `bindRepeater` is
```typescript
declare function bindRepeater<Item extends HasId, Comps>(
  repeater: RefComponent<RepeaterType<Item, Comps>>,
  data: Getter<Array<Item>>,
  fn: (
    refs: Refs<Comps>, 
    item: Getter<Item>, 
    $item: $W<Comps>) => void): 
        () => Reactive[]
```

At which
* `repeater` - is the reference to the repeater component
* `data` - is the getter of the state holding the item to show in the repeater. Can be immutable or mutable object
* `fn` - the state constructor for each item state management
  * `refs` - references to the `$item` elements on the repeater item
  * `item` - getter for the repeater item object
  * `$item` - the underlying raw `$item`.
* returns - a getter for `Reactive[]` of all the current items on the repeater, 
  [Reactive - see below](#reactive).
  **Reactive is used for fine-grained computation control - in most cases the usage of Reactive directly is not needed**



## <a name="bindShowHide">bindShowHide</a>

`bindShowHide` binds an element `hidden` property, the `show` and `hide` functions to a boolean state with animation support.
When the state changes the element visibility will change as well, with the selected animations

```typescript
bind($w, refs => {
   let [state, setState] = createState(12);
   bindShowHide(refs.text, () => state() % 3 === 0, {
      showAnimation: {effectName: "fade", effectOptions: {duration: 2000, delay: 1000}},
      hideAnimation: {effectName: "spin", effectOptions: {duration: 1000, delay: 200, direction: 'ccw'}}
   })
   refs.up.onClick(() => setState(_ => _ + 1));
   refs.down.onClick(() => setState(_ => _ - 1));
})
```

Formally it is defined as 
```typescript
interface ShowHideOptions {
   showAnimation?: {effectName: string, effectOptions?: ArcEffectOptions | BounceEffectOptions | FadeEffectOptions | FlipEffectOptions | FloatEffectOptions | FlyEffectOptions | FoldEffectOptions | GlideEffectOptions | PuffEffectOptions | RollEffectOptions | SlideEffectOptions | SpinEffectOptions | TurnEffectOptions | ZoomEffectOptions}
   hideAnimation?: {effectName: string, effectOptions?: ArcEffectOptions | BounceEffectOptions | FadeEffectOptions | FlipEffectOptions | FloatEffectOptions | FlyEffectOptions | FoldEffectOptions | GlideEffectOptions | PuffEffectOptions | RollEffectOptions | SlideEffectOptions | SpinEffectOptions | TurnEffectOptions | ZoomEffectOptions}
}

declare function bindShowHide(el: RefComponent<$w.HiddenCollapsedMixin>, bind: Getter<boolean>, options?: ShowHideOptions)
```

## <a name="bindCollapseExpand">bindCollapseExpand</a>

`bindCollapseExpand` binds an element `collapsed` property, the `expand` and `collapse` functions to a boolean state.
When the state changes the element collapsed/expand will change as well.

```typescript
bind($w, refs => {
   let [state, setState] = createState(12);
   bindCollapseExpand(refs.text, () => state() % 3 === 0)
   refs.up.onClick(() => setState(_ => _ + 1));
   refs.down.onClick(() => setState(_ => _ - 1));
})
```

Formally it is defined as
```typescript
declare function bindCollapseExpand(el: RefComponent<$w.HiddenCollapsedMixin>, bind: Getter<boolean>)
```

## <a name="bindEnabled">bindEnabled</a>

`bindEnabled` binds an element `disabled` property, the `enable` and `disable` functions to a boolean state.
When the state changes the element enablement will change as well.

```typescript
bind($w, refs => {
   let [state, setState] = createState(12);
   bindEnabled(refs.text, () => state() % 3 === 0)
   refs.up.onClick(() => setState(_ => _ + 1));
   refs.down.onClick(() => setState(_ => _ - 1));
})
```

Formally it is defined as
```typescript
declare function bindEnabled(el: RefComponent<$w.DisabledMixin>, bind: Getter<boolean>
```


## <a name="reactive">Reactive</a>

`bind` returns an instance of `Reactive` [Jay Reactive](https://www.npmjs.com/package/jay-reactive#reactive-class) which exposes the lower level APIs and gives more control over
reactions batching and flushing. 

```typescript
import {bind, createState} from 'velo-hooks';

$w.onReady(() => {
   let reactive = bind($w, refs => {
      let [state1, setState1] = createState(1);
      let [state2, setState2] = createState(1);
      let [state3, setState3] = createState(1);
      let double = createMemo(() => _ * 2);
      let plus10 = createMemo(() => _ + 10);
      let sum = createMemo(() => state1() + state2() + state3());
      refs.button1.onClick(() => {
         setState1(10);
         setState2(10);
         setState3(10);
      }) // computation of double, plus10 and sum reactions done in an async batch

      refs.button1.onClick(() => {
         reactive.batchReactions(() => {
            setState1(10);
            setState2(10);
         }) // computation of double, plus10 and sum reactions done on exit from batchReactions
         setState3(10);
      }) // computation of sum reaction done in an async batch 

      refs.button1.onClick(() => {
         setState1(10);
         setState2(10);
         reactive.flush() // computation of double, plus10 and sum reactions done sync on flush
         setState3(10);
      }) // computation of sum reaction done in an async batch

      refs.button1.onClick(async () => {
         setState1(10);
         setState2(10);
         await reactive.toBeClean() // computation of double, plus10 and sum reactions done async on flush
         setState3(10);
      }) // computation of sum reaction done in an async batch
   })
})
```
