class Button {
  label: string
  onClick: (event: any) => void
  click() {
    if (this.onClick)
      this.onClick({});
  }
}

class Text {
  text: string
  html: string
}

export interface $W<T> {
  <K extends keyof T, V extends T[K]>(id: `#${K}`): V
  onReady: (fn: () => Promise<void>) => Promise<void>
}

export function make_$w<T>(comps: T): $W<T> {
  let $w: $W<T> = function(id) {
    return comps[id.substring(1)]
  } as $W<T>;
  $w.onReady = function(fn: () => Promise<void>) {
    return fn();
  }
  return $w;
}


let $w = make_$w({
  up: new Button(),
  down: new Button(),
  text: new Text()
})

$w('#up').label = 12;
