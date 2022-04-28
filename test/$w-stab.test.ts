import {describe, expect, it, jest} from '@jest/globals'
import {Button, make_$w, Repeater, Text} from "./$w-stab";
import {$W} from "../lib";


describe("$w stab", () => {
  describe('regular components', () => {
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
      // @ts-ignore
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
  })

  describe('repeater', () => {
    let $w = make_$w({
      add: new Button(),
      items: new Repeater(() => ({
        title: new Text(),
        description: new Text(),
        remove: new Button()
      }))
    })
    
    const one = {_id: "1", title: "one", description: "the one"}
    const two = {_id: "2", title: "two", description: "the second"}
    const three = {_id: "3", title: "three", description: "the best"}

    it('given data, create the items and call onItemReady', () => {
      let fn = jest.fn();
      $w('#items').onItemReady = fn;
      $w('#items').data = [one, two];

      expect(fn.mock.calls.length).toBe(2);
      expect(fn.mock.calls[0][1]).toBe(one);
      expect(fn.mock.calls[0][2]).toBe(0);
      expect(fn.mock.calls[1][1]).toBe(two);
      expect(fn.mock.calls[1][2]).toBe(1);
    })

    it('given new data, call onItemReady for new items and onItemRemoved for removed items', () => {
      let fnReady = jest.fn();
      let fnRemoved = jest.fn();
      $w('#items').onItemReady = fnReady;
      $w('#items').onItemRemoved = fnRemoved;
      $w('#items').data = [one, two];

      expect(fnReady.mock.calls.length).toBe(2);

      $w('#items').data = [one, three];

      expect(fnReady.mock.calls.length).toBe(3);
      expect(fnReady.mock.calls[2][1]).toBe(three);
      expect(fnReady.mock.calls[2][2]).toBe(1);

      expect(fnRemoved.mock.calls.length).toBe(1);
      expect(fnRemoved.mock.calls[0][0]).toBe(two);
    })

    it('given data, create the items $w', () => {
      $w('#items').onItemReady = ($Item, itemData, index) => {
        expect($Item('#title')).toBeDefined();
        expect($Item('#description')).toBeDefined();
        expect($Item('#remove')).toBeDefined();
        expect(itemData).toBe(two);
      };
      $w('#items').data = [two];
    })

    it('given data, support forItems', () => {
      let fn = jest.fn();
      $w('#items').onItemReady = ($Item, itemData) => {
        $Item('#title').text = itemData.title;
      };
      $w('#items').data = [one, two];

      $w('#items').forItems([one._id], ($Item, itemData, index) => {
        expect(itemData).toBe(one);
        expect($Item('#title').text).toBe(one.title);
      })
    })
  })
});
