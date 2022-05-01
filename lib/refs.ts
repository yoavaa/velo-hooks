import {Getter, GetterMark} from "jay-reactive";
import {$W, createEffect, useReactive} from "./hooks-internal";

export type RefComponent<C> = {
  [K in keyof C]: C[K] extends Function? C[K] : Getter<C[K]>
}

export type Refs<T> = {
  [K in keyof T]: RefComponent<T[K]>
}

export function setValue<T>(t: T): Getter<T> {
  let getter = () => t;
  getter[GetterMark] = true;
  return getter;
}

export function makeRefs<T>($w: $W<T>): Refs<T>  {
  return new Proxy($w, {
    get: function(obj, prop) {
      if (prop === 'onReady')
        return $w.onReady;
      else { // @ts-ignore
        if ($w('#'+prop))
        { // @ts-ignore
          return componentProxy($w('#'+prop))
        }
        else
          throw new Error(`component with id [#${String(prop)}] not found`)
      }
    }
  }) as any as Refs<T>
}

function componentProxy<T extends object>(comp: T): RefComponent<T> {
  let reactive = useReactive();
  return new Proxy(comp, {
    get: function(obj, prop) {
      let rawValue = obj[prop];
      if (rawValue instanceof Function)
        return (...args) => (rawValue as Function).apply(obj, args);
      else
        return () => rawValue;
    },
    set: function(obj, prop, value) {
      if (value[GetterMark])
        createEffect(() => {
          obj[prop] = value();
        })
      else if (value instanceof Function)
        obj[prop] = (...args) => {
          reactive.batchReactions(() => value(...args))
        }
      else
        obj[prop] = value
      return true;
    }
  }) as any as RefComponent<T>;
}