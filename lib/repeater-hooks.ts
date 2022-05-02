import {$W, createEffect, createState, useReactive} from "./velo-hooks";
import {Getter, Reactive, Setter} from "jay-reactive";
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
  onItemReady(handler: OnItemReady<Item, Comps>)
  onItemRemoved(handler: OnItemRemoved<Item>)
}

export function bindRepeater<Item extends HasId, Comps>(
  repeater: RefComponent<RepeaterType<Item, Comps>>,
  data: Getter<Array<Item>>,
  fn: (refs: Refs<Comps>, item: Getter<Item>, $item: $W<Comps>) => void
): () => Reactive[] {
  let itemsMap = new Map<string, [Item, Setter<Item>, Reactive]>()
  repeater.onItemReady(($item: $W<Comps>, itemData: Item) => {
    reactiveContextStack.doWithContext(new Reactive(), () => {
      useReactive().record(() => {
        let [item, setItem] = createState(itemData);
        itemsMap.set(itemData._id, [itemData, setItem, useReactive()]);
        fn(makeRefs($item), item, $item);
      })
    })
  })
  repeater.onItemRemoved((itemData: Item) => {
    itemsMap.delete(itemData._id);
  })

  createEffect(() => {
    data().forEach(itemData => {
      if (itemsMap.has(itemData._id)) {
        let [oldItem, setter, reactive] = itemsMap.get(itemData._id);
        if (oldItem !== itemData) {
          setter(itemData);
          itemsMap.set(itemData._id, [itemData, setter, reactive]);
        }
      }
    })
  })
  repeater.data = data;
  return () => [...itemsMap.values()].map(_ => _[2]);
}