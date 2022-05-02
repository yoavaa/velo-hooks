import {beforeEach, describe, expect, it} from '@jest/globals'
import {Box, Button, Input, make_$w, Repeater, Text} from "./$w-stab";
import {$W, bind, createMemo, createState, Refs, setValue, useReactive} from "../lib/hooks-internal";
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
    beforeEach(() => {
      $w = make_$w({
        firstName: new Text(),
        lastName: new Text(),
        age: new Text(),
        firstNameInput: new Input(),
        lastNameInput: new Input(),
        ageInput: new Input()
      })

      bind($w, refs => {
        let person = mutableObject({
          firstName: "Joe",
          lastName: "Smith",
          age: 25
        });
        let [state, _] = createState(person)
        refs.firstName.text = createMemo(() => state().firstName);
        refs.lastName.text = createMemo(() => state().lastName);
        refs.age.text = createMemo(() => ''+ state().age);
        refs.firstNameInput.onChange = (event => person.firstName = event.value)
        refs.lastNameInput.onChange = (event => person.lastName = event.value)
        refs.ageInput.onChange = (event => person.age = Number(event.value))
      })
    })

    it('should render the person values', () => {
      expect($w('#firstName').text).toBe('Joe')
      expect($w('#lastName').text).toBe('Smith')
      expect($w('#age').text).toBe('25')
    })

    it('should update name', () => {
      $w('#firstNameInput').change('John')
      expect($w('#firstName').text).toBe('John')
      expect($w('#lastName').text).toBe('Smith')
      expect($w('#age').text).toBe('25')
    })

    it('should update age', () => {
      $w('#ageInput').change('30')
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
        bindRepeater(refs.people, state, (itemRefs, item) => {
          itemRefs.firstName.text = createMemo(() => item().firstName);
          itemRefs.lastName.text = createMemo(() => item().lastName);
          itemRefs.age.text = createMemo(() => ''+ item().age);
          itemRefs.firstNameInput.onChange = (event => item().firstName = event.value)
          itemRefs.lastNameInput.onChange = (event => item().lastName = event.value)
          itemRefs.ageInput.onChange = (event => item().age = Number(event.value))
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

      $w('#people').forItems(['b'], ($item, itemData) => {
        expect($item('#firstName').text).toBe('John')
        expect($item('#lastName').text).toBe('Bond')
        expect($item('#age').text).toBe('30')
      })
    })

    // it('should update name', () => {
    //   $w('#firstNameInput').change('John')
    //   expect($w('#firstName').text).toBe('John')
    //   expect($w('#lastName').text).toBe('Smith')
    //   expect($w('#age').text).toBe('25')
    // })
    //
    // it('should update age', () => {
    //   $w('#ageInput').change('30')
    //   expect($w('#firstName').text).toBe('Joe')
    //   expect($w('#lastName').text).toBe('Smith')
    //   expect($w('#age').text).toBe('30')
    // })
  })
});
