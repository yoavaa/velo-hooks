import {describe, expect, it, jest} from '@jest/globals'
import {Button, make_$w, Text} from "./$w-stab";
import {bind, createMemo, createState, useReactive} from "../lib/velo-hooks";


describe("velo hooks", () => {
  let $w = make_$w({
    up: new Button(),
    down: new Button(),
    text: new Text()
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
  })
})
