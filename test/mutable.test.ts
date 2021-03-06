import {beforeEach, describe, expect, it} from '@jest/globals'
import {Input, make_$w, Repeater, Text} from "./$w-stab";
import {$W, bind, createMemo, createState} from "../lib/hooks-internal";
import {mutableObject} from "../lib";
import {bindRepeater} from "../lib/repeater-hooks";

describe("mutable state", () => {

  describe('mutable singles', () => {
    interface App1 {
      firstName: Text,
      lastName: Text,
      age: Text
      firstNameInput: Input,
      lastNameInput: Input,
      ageInput: Input
    }

    let $w: $W<App1>
    let testReactive;
    beforeEach(() => {
      $w = make_$w({
        firstName: new Text(),
        lastName: new Text(),
        age: new Text(),
        firstNameInput: new Input(),
        lastNameInput: new Input(),
        ageInput: new Input()
      })

      testReactive = bind($w, refs => {
        let person = mutableObject({
          firstName: "Joe",
          lastName: "Smith",
          age: 25
        });
        let [state, _] = createState(person)
        refs.firstName.text = createMemo(() => state().firstName);
        refs.lastName.text = createMemo(() => state().lastName);
        refs.age.text = createMemo(() => ''+ state().age);
        refs.firstNameInput.onChange((event => person.firstName = event.value))
        refs.lastNameInput.onChange((event => person.lastName = event.value))
        refs.ageInput.onChange((event => person.age = Number(event.value)))
      })
    })

    it('should render the person values', () => {
      expect($w('#firstName').text).toBe('Joe')
      expect($w('#lastName').text).toBe('Smith')
      expect($w('#age').text).toBe('25')
    })

    it('should update name', async () => {
      $w('#firstNameInput').change('John')
      await testReactive.toBeClean();
      expect($w('#firstName').text).toBe('John')
      expect($w('#lastName').text).toBe('Smith')
      expect($w('#age').text).toBe('25')
    })

    it('should update age', async () => {
      $w('#ageInput').change('30')
      await testReactive.toBeClean();
      expect($w('#firstName').text).toBe('Joe')
      expect($w('#lastName').text).toBe('Smith')
      expect($w('#age').text).toBe('30')
    })
  });

  describe('mutable repeater', () => {
    interface Person {
      _id: string
      firstName: string,
      lastName: string,
      age: number
    }

    interface PersonItem {
      firstName: Text,
      lastName: Text,
      age: Text
      firstNameInput: Input,
      lastNameInput: Input,
      ageInput: Input
    }

    interface App1 {
      people: Repeater<Person, PersonItem>
    }

    let $w: $W<App1>
    let reactive;
    let itemReactives;
    beforeEach(() => {
      $w = make_$w({
        people: new Repeater(() => ({
          firstName: new Text(),
          lastName: new Text(),
          age: new Text(),
          firstNameInput: new Input(),
          lastNameInput: new Input(),
          ageInput: new Input()
        })),
      })

      reactive = bind($w, refs => {
        let people = mutableObject([
          {
            _id: 'a',
            firstName: "Joe",
            lastName: "Smith",
            age: 25
          },
          {
            _id: 'b',
            firstName: "James",
            lastName: "Bond",
            age: 30
          },
          {
            _id: 'c',
            firstName: "Albert",
            lastName: "Goldman",
            age: 35
          }
        ]);
        let [state, _] = createState(people)
        itemReactives = bindRepeater(refs.people, state, (itemRefs, item) => {
          itemRefs.firstName.text = createMemo(() => item().firstName);
          itemRefs.lastName.text = createMemo(() => item().lastName);
          itemRefs.age.text = createMemo(() => ''+ item().age);
          itemRefs.firstNameInput.onChange((event => item().firstName = event.value))
          itemRefs.lastNameInput.onChange((event => item().lastName = event.value))
          itemRefs.ageInput.onChange((event => item().age = Number(event.value)))
        })
      })
    })

    it('should render people', () => {
      $w('#people').forItems(['a'], ($item, itemData) => {
        expect($item('#firstName').text).toBe('Joe')
        expect($item('#lastName').text).toBe('Smith')
        expect($item('#age').text).toBe('25')
      })
      $w('#people').forItems(['b'], ($item, itemData) => {
        expect($item('#firstName').text).toBe('James')
        expect($item('#lastName').text).toBe('Bond')
        expect($item('#age').text).toBe('30')
      })
    })

    it('should update second person name', async () => {
      $w('#people').forItems(['b'], ($item, itemData) => {
         $item('#firstNameInput').change('John');
      });

      await reactive.toBeClean();
      await Promise.all((itemReactives().map(_ => _.toBeClean())));

      $w('#people').forItems(['b'], ($item, itemData) => {
        expect($item('#firstName').text).toBe('John')
        expect($item('#lastName').text).toBe('Bond')
        expect($item('#age').text).toBe('30')
      })
    })
  })
});
