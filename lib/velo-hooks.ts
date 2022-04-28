import {Getter, GetterMark, Reactive, Setter, ValueOrGetter} from "jay-reactive";
import {ContextStack} from "./ContextStack";

export type RefComponent<C> = {
  [K in keyof C]: C[K] extends Function? C[K] : Getter<C[K]> | C[K]
}

export type Refs<T> = {
  [K in keyof T]: RefComponent<T[K]>
}

type EffectCleanup = () => void

export interface $W<T> {
  // @ts-ignore
  <K extends keyof T, V extends T[K]>(id: `#${K}`): V
  onReady: (fn: () => Promise<void>) => Promise<void>
  bind: (fn: (refs: Refs<T>) => void) => void
}

const reactiveContextStack = new ContextStack<Reactive>();

export function useReactive(): Reactive {
  return reactiveContextStack.current();
}

export function createState<T>(value: ValueOrGetter<T>): [get: Getter<T>, set: Setter<T>] {
  return useReactive().createState(value);
}

export function createEffect(effect: () => void | EffectCleanup) {
  let cleanup = undefined;

  const clean = () => {
    if (cleanup !== undefined) {
      cleanup();
      cleanup = undefined;
    }
  }

  useReactive().createReaction(() => {
    clean();
    cleanup = effect();
  })
}

export function createMemo<T>(computation: (prev: T) => T, initialValue?: T): Getter<T> {
  let [value, setValue] = useReactive().createState(initialValue);
  useReactive().createReaction(() => {
    setValue(oldValue => computation(oldValue))
  })
  return value
}

export function bind<T>($w: $W<T>, fn: (refs: Refs<T>) => void): [Refs<T>, Reactive] {
  return reactiveContextStack.doWithContext(new Reactive(), () => {
    return useReactive().record(() => {
      let refs1 = makeRefs($w);
      fn(refs1);
      return [refs1, useReactive()];
    })
  })
}

function makeRefs<T>($w: $W<T>): Refs<T>  {
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