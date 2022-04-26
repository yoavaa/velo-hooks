import {$W, bind, Refs} from '../lib'
import {ShowHideMixin} from "../lib/visiblity-hooks";

export class BaseElement implements ShowHideMixin {
  private isHidden: boolean = false;
  private isCollapsed: boolean = false;
  private animations: string[] = []

  show(effectName?: string) {
    this.isHidden = false
    this.animations.push('show ' + effectName);
  }
  hide(effectName?: string) {
    this.isHidden = true
    this.animations.push('hide ' + effectName);
  }
  get hidden() {return this.isHidden}

  collapse(effectName?: string) {
    this.isCollapsed = false
    this.animations.push('collapse ' + effectName);
  }
  expand(effectName?: string) {
    this.isCollapsed = true
    this.animations.push('expand ' + effectName);
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
