import {$W, Refs} from "./velo-hooks";

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
  repeater: RepeaterType<Item, Comps>,
  fn: (refs: Refs<Comps>) => void
) {

}