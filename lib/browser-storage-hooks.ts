import {Getter, Setter} from "jay-reactive";
import {createEffect} from "./velo-hooks";

export interface WixStorageAPI {
  getItem(key: string): string
  setItem(key: string, value: string);
  clear();
}

export function bindStorage<T>(storage: WixStorageAPI, key: string, state: Getter<T>, setState: Setter<T>) {
  let initialData = storage.getItem(key);
  if (initialData) {
    setState(JSON.parse(initialData))
  }
  createEffect(() => {
    storage.setItem(key, JSON.stringify(state()))
  })
}