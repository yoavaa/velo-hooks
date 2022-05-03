import {Getter, mutableObject, Setter} from "jay-reactive";
import {createEffect} from "./velo-hooks";

export interface WixStorageAPI {
  getItem(key: string): string
  setItem(key: string, value: string);
  clear();
}

export function bindStorage<T>(storage: WixStorageAPI, key: string, state: Getter<T>, setState: Setter<T>, isMutable: boolean = false) {
  let initialData = storage.getItem(key);
  if (initialData) {
    setState(isMutable?
      mutableObject(JSON.parse(initialData)):
      JSON.parse(initialData))
  }
  createEffect(() => {
    storage.setItem(key, JSON.stringify(state()))
  })
}