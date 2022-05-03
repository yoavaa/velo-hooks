import {$W, bind, Refs} from "../lib/hooks-internal"
import {ForItemCallback, HasId, OnItemReady, OnItemRemoved, RepeaterType} from "../lib/repeater-hooks";
import {ShowHideMixin} from "../lib";
import {WixStorageAPI} from "../lib/browser-storage-hooks";

export class BaseElement implements ShowHideMixin {
  private isHidden: boolean = false;
  private isCollapsed: boolean = false;
  private animations: string[] = []

  show(effectName?: string, options?: any) {
    this.isHidden = false
    this.animations.push('show ' + effectName);
  }
  hide(effectName?: string, options?: any) {
    this.isHidden = true
    this.animations.push('hide ' + effectName);
  }
  get hidden() {return this.isHidden}

  collapse() {
    this.isCollapsed = false
  }
  expand() {
    this.isCollapsed = true
  }
  get collapsed() {return this.isCollapsed}
  get allAnimations() {return this.animations};
}

export class Button extends BaseElement {
  label: string
  clickHandler: (event: any) => void;
  onClick(handler: (event: any) => void): void {
    this.clickHandler = handler;
  }
  click() {
    if (this.clickHandler)
      this.clickHandler({});
  }
}

export class Text extends BaseElement {
  text: string
  html: string
}

export class Box extends BaseElement {
  backgroundColor: string
}

export class Input extends BaseElement {
  change(newValue: string) {
    if (this.changeHandler)
      this.changeHandler({value: newValue})
  }
  changeHandler: (event: {value: string}) => void;
  onChange(handler: (event: {value: string}) => void) {
    this.changeHandler  = handler;
  }
}

export class Repeater<Item extends HasId, Comps> extends BaseElement implements RepeaterType<Item, Comps> {
  private _data: Array<Item> = []
  private item$ws: Map<string, [$W<Comps>, Item, number]> = new Map();
  constructor(private makeItemComponents: () => Comps) {
    super();
  }

  get data() {return this._data};
  set data(val: Array<Item>) {
    let orig = new Set(this._data.map(_ => _._id))
    let update = new Set(val.map(_ => _._id))

    for (let i = 0; i < val.length; i++)
      if (!orig.has(val[i]._id)) {
        let $item = make_$w(this.makeItemComponents());
        this.item$ws.set(val[i]._id, [$item, val[i], i]);
        if (this.itemReadyHandler)
          this.itemReadyHandler($item, val[i], i);
      }
      else {
        let [$item] = this.item$ws.get(val[i]._id);
        this.item$ws.set(val[i]._id, [$item, val[i], i])
      }

    for (let i = 0; i < this._data.length; i++)
      if (!update.has(this._data[i]._id)) {
        this.item$ws.delete(this._data[i]._id);
        if (this.itemRemovedHandler)
          this.itemRemovedHandler(this._data[i]);
      }

    this._data = val
  };

  forItems(itemIds: Array<string>, callback: ForItemCallback<Item, Comps>): void {
    itemIds.forEach(id => callback(this.item$ws.get(id)[0],
      this.item$ws.get(id)[1],
      this.item$ws.get(id)[2]))
  }

  itemReadyHandler: OnItemReady<Item, Comps>
  onItemReady(handler: OnItemReady<Item, Comps>) {
    this.itemReadyHandler = handler;
  }
  itemRemovedHandler: OnItemRemoved<Item>
  onItemRemoved(handler: OnItemRemoved<Item>) {
    this.itemRemovedHandler = handler;
  }
}

export function make_$w<T>(comps: T): $W<T> {
  let $w: $W<T> = function(id) {
    return comps[id.substring(1)]
  } as $W<T>;
  $w.onReady = function(fn: () => Promise<void>) {
    return fn();
  }
  $w.bind = function(fn: (refs: Refs<T>) => void) {
    bind($w, fn);
  }
  return $w;
}

export class LocalStorage implements WixStorageAPI {
  data = {}
  getItem(key: string): string {
    return this.data[key];
  }

  setItem(key: string, value: string) {
    this.data[key] = value;
  }

  clear() {
    this.data = {}
  }
}
