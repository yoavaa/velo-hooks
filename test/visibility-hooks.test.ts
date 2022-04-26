import {beforeEach, describe, expect, it} from '@jest/globals'
import {Box, Button, make_$w, Text} from "./$w-stab";
import {$W, bind, createMemo, createState, Refs, useReactive} from "../lib";
import {bindShowHide} from "../lib/visiblity-hooks";


describe("visibility hooks", () => {

  describe('show hide hook', () => {

    interface App1 {
      up: Button
      down: Button
      text: Text
    }

    let $w: $W<App1>
    let testRefs;
    beforeEach(() => {
      $w = make_$w({
        up: new Button(),
        down: new Button(),
        text: new Text()
      })

      testRefs = bind($w, refs => {
        let [state, setState] = createState(12);
        let textVisible = createMemo(() => state() % 3 === 0)

        refs.text.text = createMemo(() => `${state()}`);
        bindShowHide(refs.text, textVisible, {showAnimation: "jump", hideAnimation: "fade"})
        refs.up.onClick = () => setState(_ => _ + 1);
        refs.down.onClick = () => setState(_ => _ - 1);
      })
    })

    it('should be visible by default', () => {
      expect($w('#text').text).toBe('12')
      expect($w('#text').hidden).toBe(false)
    })

    it('should be hidden as count is 11, and does not divide by 3', () => {
      testRefs.down.click();
      expect($w('#text').text).toBe('11')
      expect($w('#text').hidden).toBe(true)
      expect($w('#text').allAnimations).toEqual(["show jump", 'hide fade'])
    })

    it('should be visible as count is 9, and does divide by 3', () => {
      testRefs.down.click();
      testRefs.down.click();
      testRefs.down.click();
      expect($w('#text').text).toBe('9')
      expect($w('#text').hidden).toBe(false)
      expect($w('#text').allAnimations).toEqual(["show jump", 'hide fade', 'show jump'])
    })
  })

})
