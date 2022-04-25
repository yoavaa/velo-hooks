import {describe, expect, it, jest} from '@jest/globals'
import {Button, make_$w, Text} from "./$w-stab";


describe("$w stab", () => {
  let $w = make_$w({
    up: new Button(),
    down: new Button(),
    text: new Text()
  })

  it('should have the up button', () => {
    expect($w('#up')).toBeDefined()
  })

  it('up button should be a Button', () => {
    expect($w('#up')).toBeInstanceOf(Button)
  })

  it('non existing compoennt should not be', () => {
    expect($w('#nonExisting')).not.toBeDefined()
  })

  describe('button', () => {
    it('should call onClick on a click', () => {
      let fn = jest.fn();
      $w('#up').onClick = fn;
      $w('#up').click();

      expect(fn).toHaveBeenCalled()
    })
  })
});
