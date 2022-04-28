import {beforeEach, describe, it, expect} from '@jest/globals'
import {Button, make_$w, Repeater, Text} from "./$w-stab";
import {$W, bind, createMemo, createState, Refs} from "../lib/hooks-internal";
import {bindRepeater, HasId} from "../lib/repeater-hooks";

const one = {_id: "1", title: "one"};
const two = {_id: "2", title: "two"};
const three = {_id: "3", title: "three"};
describe("repeater", () => {

  interface Item extends HasId {
    _id: string
    title: string
  }

  interface Slide {
    title: Text
    remove: Button
  }

  interface App1 {
    addNew: Button
    totalItems: Text
    repeater: Repeater<Item, Slide>
  }

  let $w: $W<App1>
  let testRefs: Refs<App1>;
  beforeEach(() => {
    let next = 2;
    $w = make_$w({
      addNew: new Button(),
      totalItems: new Text(),
      repeater: new Repeater<Item, Slide>(() => ({
        title: new Text(),
        remove: new Button()
      }))
    })

    testRefs = bind($w, (refs) => {
      let [items, setItems] = createState([
        one,
        two,
      ] as Item[])
      refs.totalItems.text = createMemo(() => "" + items().length);
      refs.addNew.onClick = () => {
        setItems([...items(), {_id: "" + next++, title: "item " + next}])
      }
      bindRepeater(refs.repeater, items, (refs, item) => {
        refs.title.text = createMemo(() => item().title);
        refs.remove.onClick = () => {
          setItems(items().filter(_ => _._id !== item()._id))
        }
      })
    })[0]
  })

  const assertRepeaterRendersItem = (item: Item) => {
    $w('#repeater').forItems([item._id], ($item, itemData) => {
      expect(itemData).toEqual(item)
      expect($item("#title").text).toBe(item.title);
    })
  }

  it("should render a repeater", () => {
    assertRepeaterRendersItem(one);
    assertRepeaterRendersItem(two);
  })

  it("should update a repeater", () => {
    testRefs.repeater.data = [one, three];
    assertRepeaterRendersItem(one);
    assertRepeaterRendersItem(three);
  })



});
