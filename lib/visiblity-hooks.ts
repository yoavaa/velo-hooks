import {Getter} from "jay-reactive";
import {useReactive} from "./velo-hooks";


export interface ShowHideMixin {
  show(effectName?: string, options?: any)
  hide(effectName?: string, options?: any)
  get hidden()

  collapse()
  expand()
  get collapsed()
}

interface ShowHideOptions {
  showAnimation?: {effectName: string, effectOptions?: any}
  hideAnimation?: {effectName: string, effectOptions?: any}
}

interface CollapseExpandOptions {
  expandAnimation?: string
  collapseAnimation?: string
}

export function bindShowHide(el: ShowHideMixin, bind: Getter<boolean>, options?: ShowHideOptions) {
  useReactive().createReaction(() => {
    if (bind())
      options?.showAnimation?
        el.show(options.showAnimation.effectName, options.showAnimation.effectOptions) :
        el.show();
    else
      options?.hideAnimation?
        el.hide(options.hideAnimation.effectName, options.hideAnimation.effectOptions) :
        el.hide();
  })
}

export function bindCollapseExpand(el: ShowHideMixin, bind: Getter<boolean>, options?: CollapseExpandOptions) {
  useReactive().createReaction(() => {
    if (bind())
      el.expand()
    else
      el.collapse()
  })
}