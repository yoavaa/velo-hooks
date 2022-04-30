import {$W, bind, Refs} from "../lib/hooks-internal"
import {ForItemCallback, HasId, OnItemReady, OnItemRemoved, RepeaterType} from "../lib/repeater-hooks";
import {ShowHideMixin} from "../lib";

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
  onClick: (event: any) => void
  click() {
    if (this.onClick)
      this.onClick({});
  }
}

export class Text extends BaseElement {
  text: string
  html: string
}

export class Box extends BaseElement {
  backgroundColor: string
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
        let $w = make_$w(this.makeItemComponents());
        this.item$ws.set(val[i]._id, [$w, val[i], i]);
        if (this.onItemReady)
          this.onItemReady($w, val[i], i);
      }

    for (let i = 0; i < this._data.length; i++)
      if (!update.has(this._data[i]._id)) {
        this.item$ws.delete(this._data[i]._id);
        if (this.onItemRemoved)
          this.onItemRemoved(this._data[i]);
      }

    this._data = val
  };

  forItems(itemIds: Array<string>, callback: ForItemCallback<Item, Comps>): void {
    itemIds.forEach(id => callback(this.item$ws.get(id)[0],
      this.item$ws.get(id)[1],
      this.item$ws.get(id)[2]))
  }

  onItemReady: OnItemReady<Item, Comps>
  onItemRemoved: OnItemRemoved<Item>
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


let $w = make_$w({
  up: new Button(),
  down: new Button(),
  text: new Text()
})

$w('#up').label = '12';
