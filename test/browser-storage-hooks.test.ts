import {beforeEach, describe, expect, it} from '@jest/globals'
import {Button, LocalStorage, make_$w, Text} from "./$w-stab";
import {$W, bind, createState} from "../lib/velo-hooks";
import {bindStorage} from "../lib/browser-storage-hooks";

describe('storage hooks', () => {

  interface App1 {
    up: Button
    down: Button
    text: Text
  }

  let storage = new LocalStorage();

  let $w: $W<App1>
  beforeEach(() => {
    $w = make_$w({
      up: new Button(),
      down: new Button(),
      text: new Text()
    })
  })

  function makeApp() {
    return bind($w, refs => {
      let [state, setState] = createState(12);
      refs.text.text = () => `${state()}`;
      refs.up.onClick(() => setState(_ => _ + 1));
      refs.down.onClick(() => setState(_ => _ - 1));
      bindStorage(storage, 'data', state, setState)
    })
  }

  it('should store counter value', () => {
    makeApp();
    expect(storage.getItem('data')).toEqual("12")
  })

  it('should store counter updated value', async () => {
    let testReactive = makeApp();
    $w('#up').click();
    await testReactive.toBeClean()
    expect(storage.getItem('data')).toEqual("13")
  })

  it('should read initial data from store', () => {
    storage.setItem('data', '10')
    makeApp();
    expect($w('#text').text).toEqual("10")
  })

  it('should read initial data from store, increment and store incremented', async () => {
    storage.setItem('data', '10')
    let testReactive = makeApp();
    $w('#up').click();
    await testReactive.toBeClean()
    expect($w('#text').text).toEqual("11")
  })
})