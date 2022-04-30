import {$W, createState} from "./velo-hooks";
import {Getter, Reactive} from "jay-reactive";
import {reactiveContextStack} from "./ContextStack";
import {makeRefs, RefComponent, Refs} from "./hooks-internal";

export interface HasId {
  _id: string
  [key: string]: any
}

export type OnItemReady<Item extends HasId, Item$W> = ($item: $W<Item$W>, itemData: Item, index: number) => void;
export type OnItemRemoved<Item extends HasId> = (itemData: Item) => void
export type ForItemCallback<Item extends HasId, Item$W> = ($item: $W<Item$W>, itemData: Item, index: number) => void;

export interface RepeaterType<Item extends HasId, Comps> {
  get data(): Array<Item>
  set data(val: Array<Item>)
  forItems(itemIds: Array<string>, callback: ForItemCallback<Item, Comps>): void
  onItemReady: OnItemReady<Item, Comps>
  onItemRemoved: OnItemRemoved<Item>
}

export function bindRepeater<Item extends HasId, Comps>(
  repeater: RefComponent<RepeaterType<Item, Comps>>,
  data: Getter<Array<Item>>,
  fn: (refs: Refs<Comps>, item: Getter<Item>) => void
) {
  repeater.onItemReady = ($item: $W<Comps>, itemData: Item, index: number) => {
    console.log('1')
    reactiveContextStack.doWithContext(new Reactive(), () => {
      let [item, setItem] = createState(itemData);
      fn(makeRefs($item), item);
    })
    console.log('2')
  }

  repeater.data = data;
}