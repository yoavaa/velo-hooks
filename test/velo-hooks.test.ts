import {describe, expect, it, jest, beforeEach} from '@jest/globals'
import {Box, Button, make_$w, Text} from "./$w-stab";
import {$W, bind, createMemo, createState, Refs, useReactive} from "../lib/velo-hooks";


describe("velo hooks", () => {

  describe('generic tests', () => {

    interface App1 {
      up: Button
      down: Button
      text: Text
    }

    let $w: $W<App1>
    beforeEach(() => {
      $w = make_$w({
        up: new Button(),
        down: new Button(),
        text: new Text()
      })
    })

    describe('refs', () => {
      it('should bind properties', () => {
        bind($w, refs => {
          refs.text.text = 'some text'
        })
        expect($w('#text').text).toBe('some text')
      })
    })

    describe('state and props', () => {
      it('should bind property to state', () => {
        bind($w, refs => {
          let [state, setState] = createState('some text');
          refs.text.text = state;
        })
        expect($w('#text').text).toBe('some text')
      })

      it('should update batched properties on batch end', async () => {
        let state, setState;
        bind($w, refs => {
          [state, setState] = createState('some text');
          refs.text.text = state;
        })
        useReactive().batchReactions(() => {
          setState('a new text')
        })

        expect($w('#text').text).toBe('a new text')
      })

      it('should update property async from state update not in batch', async () => {
        let state, setState;
        bind($w, refs => {
          [state, setState] = createState('some text');
          refs.text.text = state;
        })
        setState('a new text')

        expect($w('#text').text).toBe('some text')
        await useReactive().toBeClean();
        expect($w('#text').text).toBe('a new text')
      })

      it('should update property from state update on flush', () => {
        let state, setState;
        bind($w, refs => {
          [state, setState] = createState('some text');
          refs.text.text = state;
        })
        setState('a new text')
        expect($w('#text').text).toBe('some text')
        useReactive().flush();
        expect($w('#text').text).toBe('a new text')
      })
    })

    describe('events, state and memo', () => {
      it('should bind memo to property', () => {
        let testRefs = bind($w, refs => {
          let [state, setState] = createState(12);
          let label = createMemo(() => `${state()}`)
          refs.text.text = label;
          refs.up.onClick = () => setState(_ => _ + 1);
          refs.down.onClick = () => setState(_ => _ - 1);
        })

        expect($w('#text').text).toBe('12')
      })

      it('should update prop using memo from event', () => {
        let testRefs = bind($w, refs => {
          let [state, setState] = createState(12);
          let label = createMemo(() => `${state()}`)
          refs.text.text = label;
          refs.up.onClick = () => setState(_ => _ + 1);
          refs.down.onClick = () => setState(_ => _ - 1);
        })

        testRefs.up.click();
        expect($w('#text').text).toBe('13')
      })

      it('should update prop using memo from multiple event invocations', () => {
        let testRefs = bind($w, refs => {
          let [state, setState] = createState(12);
          let label = createMemo(() => `${state()}`)
          refs.text.text = label;
          refs.up.onClick = () => setState(_ => _ + 1);
          refs.down.onClick = () => setState(_ => _ - 1);
        })

        testRefs.up.click();
        testRefs.up.click();
        testRefs.up.click();
        testRefs.down.click();
        expect($w('#text').text).toBe('14')
      })
    })

  })

  describe('counter', () => {

    interface App2 {
      increment: Button
      decrement: Button
      counter: Text
      counterExtraView: Text
      box1: Box
    }

    let $w: $W<App2>
    let testRefs: Refs<App2>
    beforeEach(() => {
      $w = make_$w({
        increment: new Button(),
        decrement: new Button(),
        counter: new Text(),
        counterExtraView: new Text(),
        box1: new Box()
      })

      testRefs = bind($w, refs => {
        let [counter, setCounter] = createState(30);
        let formattedCounter = createMemo(() => `${counter()}`);
        let step = createMemo(() => Math.abs(counter()) >= 10 ? 5 : 1)

        refs.counter.text = formattedCounter;
        refs.increment.onClick = () => setCounter(_ => _ + step())
        refs.decrement.onClick = () => setCounter(_ => _ - step())
        refs.counterExtraView.text = formattedCounter
        refs.box1.backgroundColor = createMemo(() => counter() % 2 === 0 ? `blue` : 'red')
      })

    });

    it('should render initial value', () => {
      expect($w('#counter').text).toBe('30');
      expect($w('#counterExtraView').text).toBe('30');
      expect($w('#box1').backgroundColor).toBe('blue');
    })

    it('should render initial value', () => {
      testRefs.increment.click();

      expect($w('#counter').text).toBe('35');
      expect($w('#counterExtraView').text).toBe('35');
      expect($w('#box1').backgroundColor).toBe('red');
    })
  })
})
