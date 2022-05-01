import {Getter, Reactive, Setter, ValueOrGetter} from "jay-reactive";
import {reactiveContextStack} from "./ContextStack";
import {makeRefs, Refs} from "./hooks-internal";

type EffectCleanup = () => void

export interface $W<T> {
  // @ts-ignore
  <K extends keyof T, V extends T[K]>(id: `#${K}`): V
  onReady: (fn: () => Promise<void>) => Promise<void>
}


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

export function bind<T>($w: $W<T>, fn: (refs: Refs<T>) => void): Reactive {
  return reactiveContextStack.doWithContext(new Reactive(), () => {
    return useReactive().record(() => {
      let refs1 = makeRefs($w);
      fn(refs1);
      return useReactive();
    })
  })
}

