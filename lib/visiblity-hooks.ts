import {Getter} from "jay-reactive";
import {useReactive} from "./velo-hooks";


export interface ShowHideMixin {
  show(effectName?: string)
  hide(effectName?: string)
  get hidden()

  collapse(effectName?: string)
  expand(effectName?: string)
  get collapsed()
}

interface ShowHideOptions {
  showAnimation?: string
  hideAnimation?: string
}

interface CollapseExpandOptions {
  expandAnimation?: string
  collapseAnimation?: string
}

export function bindShowHide(el: ShowHideMixin, bind: Getter<boolean>, options?: ShowHideOptions) {
  useReactive().createReaction(() => {
    if (bind())
      el.show(options?.showAnimation?options.showAnimation:"")
    else
      el.hide(options?.showAnimation?options.hideAnimation:"")
  })
}

export function bindCollapseExpand(el: ShowHideMixin, bind: Getter<boolean>, options?: CollapseExpandOptions) {
  useReactive().createReaction(() => {
    if (bind())
      el.expand(options?.expandAnimation?options.expandAnimation:"")
    else
      el.collapse(options?.collapseAnimation?options.collapseAnimation:"")
  })
}