import {beforeEach, describe, expect, it} from '@jest/globals'
import {Box, Button, make_$w, Text} from "./$w-stab";
import {$W, bind, createMemo, createState, Refs, setValue, useReactive} from "../lib/hooks-internal";


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
          refs.text.text = setValue('some text');
        })
        expect($w('#text').text).toBe('some text')
      })
    })

    describe('state and props', () => {
      it('should bind property to state', () => {
        bind($w, refs => {
          let [state, ] = createState('some text');
          refs.text.text = state;
        })
        expect($w('#text').text).toBe('some text')
      })

      it('should update batched properties on batch end', async () => {
        let state, setState;
        let reactive = bind($w, refs => {
          [state, setState] = createState('some text');
          refs.text.text = state;
        })
        reactive.batchReactions(() => {
          setState('a new text')
        })

        expect($w('#text').text).toBe('a new text')
      })

      it('should update property async from state update not in batch', async () => {
        let state, setState;
        let reactive = bind($w, refs => {
          [state, setState] = createState('some text');
          refs.text.text = state;
        })
        setState('a new text')

        expect($w('#text').text).toBe('some text')
        await reactive.toBeClean();
        expect($w('#text').text).toBe('a new text')
      })

      it('should update property from state update on flush', () => {
        let state, setState;
        let reactive = bind($w, refs => {
          [state, setState] = createState('some text');
          refs.text.text = state;
        })
        setState('a new text')
        expect($w('#text').text).toBe('some text')
        reactive.flush();
        expect($w('#text').text).toBe('a new text')
      })
    })

    describe('events, state and memo', () => {
      beforeEach(() => {
        bind($w, refs => {
          let [state, setState] = createState(12);
          refs.text.text = createMemo(() => `${state()}`);
          refs.up.onClick = () => setState(_ => _ + 1);
          refs.down.onClick = () => setState(_ => _ - 1);
        })
      })
      it('should bind memo to property', () => {
        expect($w('#text').text).toBe('12')
      })

      it('should update prop using memo from event', () => {
        $w('#up').click();
        expect($w('#text').text).toBe('13')
      })

      it('should update prop using memo from multiple event invocations', () => {
        $w('#up').click();
        $w('#up').click();
        $w('#up').click();
        $w('#down').click();
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
    beforeEach(() => {
      $w = make_$w({
        increment: new Button(),
        decrement: new Button(),
        counter: new Text(),
        counterExtraView: new Text(),
        box1: new Box()
      })

      bind($w, refs => {
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

    it('should render incremented value', () => {
      $w('#increment').click();

      expect($w('#counter').text).toBe('35');
      expect($w('#counterExtraView').text).toBe('35');
      expect($w('#box1').backgroundColor).toBe('red');
    })

    it('should render decremented value 1', () => {
      $w('#decrement').click();
      expect($w('#counter').text).toBe('25');
      $w('#decrement').click();
      expect($w('#counter').text).toBe('20');
      $w('#decrement').click();
      expect($w('#counter').text).toBe('15');
      $w('#decrement').click();
      expect($w('#counter').text).toBe('10');
      $w('#decrement').click();
      expect($w('#counter').text).toBe('5');
      $w('#decrement').click();
      expect($w('#counter').text).toBe('4');
      $w('#decrement').click();
      expect($w('#counter').text).toBe('3');
      $w('#decrement').click();
      expect($w('#counter').text).toBe('2');
      $w('#decrement').click();
      expect($w('#counter').text).toBe('1');
      expect($w('#counterExtraView').text).toBe('1');
      expect($w('#box1').backgroundColor).toBe('red');
    })
  })
})
