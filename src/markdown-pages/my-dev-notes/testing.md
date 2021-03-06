---
title: "Testing Notes"
slug: /my-dev-notes/testing-notes
parent: "Dev Notes"
date: 2019-04-20
---

- [Practices](#practices)
  - [Altering defaults values](#altering-defaults-values)
- [Marble Testing](#marble-testing)
  - [hot observables](#hot-observables)
  - [cold observables](#cold-observables)
- [Jasmine](#jasmine)
  - [Spies](#spies)
    - [`and.callThrough()`](#andcallthrough)
    - [`and.stub()`](#andstub)
    - [provide `originalFn` to `createSpy`](#provide-originalfn-to-createspy)
  - [`expect(spy1).toHaveBeenCalledBefore(spy2)`](#expectspy1tohavebeencalledbeforespy2)
- [Questions](#questions)

## Practices

### Altering defaults values

```ts
let originalTimeout: number;

beforeEach(() => {
  originalTimeout = jasmine.origTimeout;
  // Alter the `original` value
  jasmine.origTimeout = newValue;
});

afterEach(() => {
  // Back to normal
  jasmine.origTimeout = originalTimeout;
});
```

---

## Marble Testing

### hot observables

  ```ts
  function testInitialState(feature?: string) {
      store = TestBed.get(Store);
      dispatcher = TestBed.get(ActionsSubject);

      const actionSequence = '--a--b--c--d--e--f--g';
      const stateSequence =  'i-w-----x-----y--z---';
      const actionValues = {
        a: { type: INCREMENT },
        b: { type: 'OTHER' },
        c: { type: RESET },
        d: { type: 'OTHER' },
        e: { type: INCREMENT },
        f: { type: INCREMENT },
        g: { type: 'OTHER' },
      };
      const counterSteps = hot(actionSequence, actionValues);
      counterSteps.subscribe(action => store.dispatch(action));

      const counterStateWithString = feature
        ? (store as any).select(feature, 'counter1')
        : store.select('counter1');

      const counter1Values = { i: 1, w: 2, x: 0, y: 1, z: 2 };

      expect(counterStateWithString).toBeObservable(
        hot(stateSequence, counter1Values)
      );
    }  
  ```

### cold observables

```ts
const firstValue = { first: 'value' };
const firstState = { [featureName]: firstValue };
const secondValue = { secondValue: 'value' };
const secondState = { [featureName]: secondValue };

const state$ = cold('--a--a--a--b--', { a: firstState, b: secondState });
const expected$ = cold('--a--------b--', {
  a: firstValue,
  b: secondValue,
});

// How are the marbles affected by the operators? :D  
const featureState$ = state$.pipe(
  map(featureSelector),
  distinctUntilChanged()
);

expect(featureState$).toBeObservable(expected$);
```

---

## Jasmine

### Spies

* `spyInstance.calls.argsFor(specificSpyInvocationIdx)`

#### `and.callThrough()`

* unless you specify this, the **spied function** will be replaced by a stub(`function () {}`)
* if specified, when you call the **spied function** it will actually call the original function(and will still keep track of its arguments):
  ```ts
  this.callThrough = function() {
    plan = originalFn;
    return getSpy();
  };
  ```

#### `and.stub()`

* tells the spy to use an _empty function_: `function () { }`

#### provide `originalFn` to `createSpy`

```ts
const projFn = jasmine.createSpy('name', () => { }).and.callThrough();
```

### `expect(spy1).toHaveBeenCalledBefore(spy2)`

* try 😃
* return type of `expect()` - make it heading

---

## Questions

[Cold observables](#cold-observables)
