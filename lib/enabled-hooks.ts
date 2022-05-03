import {Getter} from "jay-reactive";
import {useReactive} from "./velo-hooks";
import {RefComponent} from "./refs";

export interface EnabledMixin {
  enable()
  disable()
  get enabled()
}

export function bindEnabled(el: RefComponent<EnabledMixin>, bind: Getter<boolean>) {
  useReactive().createReaction(() => {
    if (bind())
      el.enable()
    else
      el.disable()
  })
}