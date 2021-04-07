---
title: Understanding the magic behind @ngrx/effects
publication: https://indepth.dev/posts/1206/understanding-the-magic-behind-ngrx-effects
date: 2020-04-20
published: true
slug: /blog/ngrxeffects
tags: ["angular", "ngrx", "publication: inDepth.dev"]
isSample: true
---

NgRx's underlying mechanisms are something definitely worth exploring. By the end of this article you'll hopefully understand not only how ngrx/effects package works under the hood, but also how ngrx/store and ngrx/effects work together.

One of the most fascinating discoveries was the way actions are handled in this whole process. As you may know, an action is a constituent of a reducer, as well as of an effect. NgRx ensures that actions are first handled by the reducers, after which they will eventually be intercepted by the effects. We'll make other interesting discoveries in this article. Let's dive in.

Contents
Providing the effects
The effects stream
EffectSources
Creating Effects
The actions stream
ofType
Connecting ngrx/store with ngrx/effects
Providing the effects
For this purpose, we can use EffectsModule.forRoot([effectClass]), EffectsModule.forFeature([effectClass]) or the USER_PROVIDED_EFFECTS multi token. The forRoot method should be used only once as it will instantiate other essential services such as EffectsRunner or EffectSources.

If you use the token approach, you must also use either forRoot or forFeature, because providing only the token won't be enough as it depends on EffectsRootModule or EffectsFeatureModule.
Once the effects (classes) are registered, in order to set them up, an observable will be created (with the help of EffectSources) and subscribed to (thanks to EffectRunner); we'll explore it in the next section.

The observable's emitted values will be the instances of those registered classes:

<>
// EffectsModule.forRoot(rootEffects)
{
  return {
    ngModule: EffectsRootModule,
    providers: [
      {
        // Make sure the `forRoot` static method is called only once
        provide: _ROOT_EFFECTS_GUARD,
        useFactory: _provideForRootGuard,
        deps: [[EffectsRunner, new Optional(), new SkipSelf()]],
      },
      EffectsRunner,
      EffectSources,
      Actions,
      rootEffects, // The array of classes(effects)
      {
          // Dependency for `ROOT_EFFECTS`
          provide: _ROOT_EFFECTS,
          // Providing it as an array because of how `createEffects` is implemented
          useValue: [rootEffects],
        },
        {
          // This token would be provided by the user in its separate module
          provide: USER_PROVIDED_EFFECTS,
          multi: true,
          useValue: [], // [UserProvidedEffectsClass]
        },
        {
          provide: ROOT_EFFECTS,
          useFactory: createEffects,
          deps: [Injector, _ROOT_EFFECTS, USER_PROVIDED_EFFECTS],
        },
    ],
  };
}

export function createEffects(
  injector: Injector,
  effectGroups: Type<any>[][],
  userProvidedEffectGroups: Type<any>[][]
): any[] {
  const mergedEffects: Type<any>[] = [];

  for (let effectGroup of effectGroups) {
    mergedEffects.push(...effectGroup);
  }

  for (let userProvidedEffectGroup of userProvidedEffectGroups) {
    mergedEffects.push(...userProvidedEffectGroup);
  }

  return createEffectInstances(injector, mergedEffects);
}

// Here the instances are created
export function createEffectInstances(/* ... */): any[] {
  return effects.map(effect => injector.get(effect));
}
In this case, EffectsRootModule will inject ROOT_EFFECTS which will contain the needed instances and will push them into the effects stream:

<>
@NgModule({})
export class EffectsRootModule {
  constructor(
    private sources: EffectSources,
    runner: EffectsRunner,
    store: Store<any>,
    @Inject(ROOT_EFFECTS) rootEffects: any[],
    /* ... */
  ) {
    // Subscribe to the `effects stream`
    // The `observer` is the Store entity 
    runner.start();

    rootEffects.forEach(effectSourceInstance =>
      // Push values into the stream
      sources.addEffects(effectSourceInstance)
    );

    store.dispatch({ type: ROOT_EFFECTS_INIT });
  }

  addEffects(effectSourceInstance: any) {
    this.sources.addEffects(effectSourceInstance);
  }
}
As a side note, you can perform specific state changes when the root effects are initialized by registering the rootEffectsInit action in a reducer:

<>
createReducer(
  initialState,
  on(rootEffectsInit, (s, a) = {/* ... */})
)
The EffectsFeatureModule (returned from EffectsModule.forFeature()) follows a similar approach, except that it will only push the effects instances into the stream:

<>
@NgModule({})
export class EffectsFeatureModule {
  constructor(
    // Make sure the essential services(EffectsRunner, EffectSources)
    // are initialized first
    root: EffectsRootModule,
    @Inject(FEATURE_EFFECTS) effectSourceGroups: any[][],
    /* ... */
  ) {
    effectSourceGroups.forEach(group =>
      group.forEach(effectSourceInstance =>
        root.addEffects(effectSourceInstance)
      )
    );
  }
}
There is also another small difference. The FEATURE_EFFECTS is a multi provider token, which means that, when injected, it will contain an array of all provided classes.

The effects stream
As described in the previous section, the EffectsRootModule does a bit more than just instantiating the effects classes. It is also in charge of creating a single stream from all the effects (e.g: results of createEffect) of the newly created instances and subscribing to it.

<>
@NgModule({})
export class EffectsRootModule {
  constructor(
    private sources: EffectSources,
    runner: EffectsRunner,
    store: Store<any>,
    @Inject(ROOT_EFFECTS) rootEffects: any[],
    @Optional() storeRootModule: StoreRootModule,
    @Optional() storeFeatureModule: StoreFeatureModule,
    @Optional()
    @Inject(_ROOT_EFFECTS_GUARD)
    guard: any
  ) {
    runner.start(); // Creating the stream

    rootEffects.forEach(effectSourceInstance =>
      sources.addEffects(effectSourceInstance)
    );

    store.dispatch({ type: ROOT_EFFECTS_INIT });
  }

  addEffects(effectSourceInstance: any) {
    // Pushing values into the stream
    this.sources.addEffects(effectSourceInstance);
  }
}
@Optional() storeRootModule: StoreRootModule and @Optional() storeFeatureModule: StoreFeatureModule will make sure that effects are initialized after the ngrx/store entities (the results of StoreModule.forRoot() and eventually StoreModule.forFeature()) have been initialized. This beforehand initialization includes:

the creation of the reducers object: all the registered reducers, those from feature modules as well, will be merged into one big object that will represent the shape of the app
the State entity - where the app information is kept, also where the place actions meet reducers, meaning it's where reducers being invoked, which may cause state changes
the Store entity - the middleman between the data consumer(e.g: a smart component) and the model(the State entity)
the ScannedActionsSubject - the stream that the effects (indirectly) subscribe to; more on this in The actions stream.
runner.start() will create a subscription to a stream resulted from the merging of all registered effects (more on this in the upcoming section). In other words, all the effects(e.g: those created by createEffect for example) will be merged into one single observable whose emitted values will be actions.

<>
// EffectsRunner

start() {
  if (!this.effectsSubscription) {
    this.effectsSubscription = this.effectSources
      .toActions()
      .subscribe(this.store);
  }
}
The stream's observer will be the Store entity. This is possible because it implements the Observer interface:

<>
export class Store<T = object> extends Observable<T>
  implements Observer<Action> {

    next(action: Action) {
      this.actionsObserver.next(action);
    }
  }
meaning that any action resulted from the effects will be intercepted by the Store which will in turn propagate it further so state changes can occur.

EffectSources
It is the place where all the registered effects will be merged into one observable, whose emitted values (actions) will be intercepted by the Store entity, which is responsible for dispatching them, so that the app state can be updated. It is also the entity that what allows lifecycle hooks to be called.

The merging behavior can be achieved with EffectSources.toActions() from below:

<>
export class EffectSources extends Subject<any> {
  constructor(
    /* ... */
    private store: Store<any>,
    /* ... */
  ) {
    super();
  }

  // Pushing an effect into the stream created by `toActions()`
  addEffects(effectSourceInstance: any): void {
    this.next(effectSourceInstance);
  }

  toActions(): Observable<Action> {
    return this.pipe(
      groupBy(getSourceForInstance),
      mergeMap(source$ => {
        return source$.pipe(groupBy(effectsInstance));
      }),
      mergeMap(source$ => {
        const effect$ = source$.pipe(
          exhaustMap(sourceInstance => {
            return resolveEffectSource(
              this.errorHandler,
              this.effectsErrorHandler
            )(sourceInstance);
          }),
          map(output => {
            reportInvalidActions(output, this.errorHandler);
            return output.notification;
          }),
          filter(
            (notification): notification is Notification<Action> =>
              notification.kind === 'N'
          ),
          dematerialize()
        );

        // start the stream with an INIT action
        // do this only for the first Effect instance
        const init$ = source$.pipe(
          take(1),
          filter(isOnInitEffects),
          map(instance => instance.ngrxOnInitEffects())
        );

        return merge(effect$, init$);
      })
    );
  }
}
Let's understand what it actually does by going through each significant block:

group the effects by their source(the instance's prototype, the class which created the instance)
As you know, groupBy will return an observable for each new key found. Then, if a value whose key is not new arrives, groupBy will use an existing observable and will push this new value through it.
This thing happens here(groupBy(getSourceForInstance)), the key is the class that created this current instance, meaning that if there are 3 distinct effect classes, groupBy will emit 3 observables.
group the instances(the effects) by their identifiers
<>
mergeMap(source$ => { // <- `source$` an observable that is resulted from the previous `groupBy`
  return source$.pipe(groupBy(effectsInstance));
}),
mergeMap is used because the first groupBy may emit multiple observables and the expected behavior is to handle all of them. Now, if the same effect class is loaded multiple times, only one instance will be used because these classes, by default, have the same identifier(and there can be only one class per identifier):

<>
function effectsInstance(sourceInstance: any) {
  if (isOnIdentifyEffects(sourceInstance)) {
    return sourceInstance.ngrxOnIdentifyEffects();
  }

  return '';
}
With ngrxOnIdentifyEffects(required by the OnIdentityEffects interface), we can specify a unique identifier for the class that contains the effects.

This, alongside groupBy(effectsInstance) and eventually exhaustMap, will make sure that only the first unique instance is used.
For example, if we have EffectsModule.forRoot([A, A, A])and they have the same identifier(e.g: '' by default), the second groupBy will emit only one observable with 3 items.

With the help of exhaustMap

<>
mergeMap(source$ => {
    const effect$ = source$.pipe(
      exhaustMap(sourceInstance => { /* ... */ }),
    )
    /* ... */
  }
)
only one item out of 3 (the first A in this case) will be taken into account.

Internally, exhaustMap uses a flag (hasSubscription) to check whether there is an active inner subscription going on or not. You can inspect the relevant code here.

merge all the effects into a single stream
<>
// `mergeMap` - for each emitted observable(emitted by the second `groupBy`)
// perform the same logic: merge all the effects(class properties)
// into one single observable
mergeMap(source$ => {
  const effect$ = source$.pipe(
    exhaustMap(sourceInstance => {
      return resolveEffectSource(
        this.errorHandler,
        this.effectsErrorHandler
    )(sourceInstance);
  }),
  /* ... */
)
resolveEffectSource will merge all the existing properties (which are observables, possibly created by createEffect()) of the current instance and will eventually call the ngrxOnRunEffectslifecycle method(required by the OnRunEffects interface):

<>
function resolveEffectSource(/* ... */): (sourceInstance: any) => Observable<EffectNotification> {
  return sourceInstance => {
    const mergedEffects$ = mergeEffects(
      sourceInstance,
      errorHandler,
      effectsErrorHandler
    );

    if (isOnRunEffects(sourceInstance)) {
      return sourceInstance.ngrxOnRunEffects(mergedEffects$);
    }

    return mergedEffects$;
  };
}
With ngrxOnRunEffects we can alter the observable resulted from merging all the effects(the instance's properties).

<>
export function mergeEffects(
  sourceInstance: any,
  globalErrorHandler: ErrorHandler,
  effectsErrorHandler: EffectsErrorHandler
): Observable<EffectNotification> {
  const sourceName = getSourceForInstance(sourceInstance).constructor.name;

  // `getSourceMetadata(sourceInstance)` - getting all the effect class' properties
  const observables$: Observable<any>[] = getSourceMetadata(sourceInstance).map(
    ({
      propertyName,
      dispatch,
      useEffectsErrorHandler,
    }): Observable<EffectNotification> => {
      const observable$: Observable<any> =
        typeof sourceInstance[propertyName] === 'function'
          ? sourceInstance[propertyName]()
          : sourceInstance[propertyName];

      // Whether it should re-subscribe if errors occur
      const effectAction$ = useEffectsErrorHandler
        ? effectsErrorHandler(observable$, globalErrorHandler)
        : observable$;

      // You might not want the `Store` to intercept the action
      // and trigger state changes based on it
      if (dispatch === false) {
        return effectAction$.pipe(ignoreElements());
      }

      const materialized$ = effectAction$.pipe(materialize());

      return materialized$.pipe(
        map(/* ... */)
      );
    }
  );

  return merge(...observables$);
}
A smaller example that reproduces the merging operation can be found here.

What const materialized$ = effectAction$.pipe(materialize()) does is to make sure that if the re-subscription on error does not occur, it will suppress any incoming errors, meaning that the stream of all the merged effects won't be broken.

At this stage, after all the effect class' properties are merged into one observable, the ngrxOnInitEffects lifecycle method (required by the OnInitEffects interface) will be called for each class (if it exists) so that an action will be dispatched immediately and once:

<>
mergeMap(source$ => {
    // Merged effects
    const effect$ = source$.pipe(
      exhaustMap(/* ... */),
      /* ... */
    );

    // `source$`'s value is an effect class instance
    const init$ = source$.pipe(
      // `take(1)` -> make sure the `exhaustMap`'s behavior is `replicated`
      // as there is only one effect class per identifier
      take(1),  
      filter(isOnInitEffects),
      // `instance.ngrxOnInitEffects()` -> Action
      map(instance => instance.ngrxOnInitEffects())
    );

    return merge(effect$, init$);
})
The above process could be visualized as follows:


Creating Effects
Creating an effect can be achieved with the createEffect() function:

<>
type DispatchType<T> = T extends { dispatch: infer U } ? U : true;
type ObservableType<T, OriginalType> = T extends false ? OriginalType : Action;

export function createEffect<
  C extends EffectConfig,
  DT extends DispatchType<C>,
  OT extends ObservableType<DT, OT>,
  R extends Observable<OT> | ((...args: any[]) => Observable<OT>)
>(source: () => R, config?: Partial<C>): R & CreateEffectMetadata {
  const effect = source();
  const value: EffectConfig = {
    ...DEFAULT_EFFECT_CONFIG,
    ...config, // Overrides any defaults if values are provided
  };
  Object.defineProperty(effect, CREATE_EFFECT_METADATA_KEY, {
    value,
  });
  return effect as typeof effect & CreateEffectMetadata;
}
createEffect() will return an observable with a property CREATE_EFFECT_METADATA_KEY attached to it which will hold the configuration object for that particular effect. When the merging of the effects class' properties into one observable takes place, each observable(property of that effect class) will be slightly altered, depending on the configuration. This object can have 2 properties:

dispatch: boolean - whether the resulting action should be dispatched to the store or not;
<>
const observable$: Observable<any> =
  typeof sourceInstance[propertyName] === 'function'
    ? sourceInstance[propertyName]()
    : sourceInstance[propertyName];

const effectAction$ = useEffectsErrorHandler
  ? effectsErrorHandler(observable$, globalErrorHandler)
  : observable$;

if (dispatch === false) {
  return effectAction$.pipe(ignoreElements());
}
The ignoreElements operator will ignore everything, except error or complete notifications.

useEffectsErrorHandler: boolean - whether effect's errors(e.g: due to external API calls) should be handled or not;
<>
const observable$: Observable<any> =
  typeof sourceInstance[propertyName] === 'function'
    ? sourceInstance[propertyName]()
    : sourceInstance[propertyName];

const effectAction$ = useEffectsErrorHandler
  ? effectsErrorHandler(observable$, globalErrorHandler)
  : observable$;
effectsErrorHandler maps to a value provided by the EFFECTS_ERROR_HANDLER. By default, it maps to defaultEffectsErrorHandler(the built-in error handler for effects):

<>
export function defaultEffectsErrorHandler<T extends Action>(
  observable$: Observable<T>,
  errorHandler: ErrorHandler,
  retryAttemptLeft: number = MAX_NUMBER_OF_RETRY_ATTEMPTS
): Observable<T> {
  return observable$.pipe(
    catchError(error => {
      if (errorHandler) errorHandler.handleError(error);
      if (retryAttemptLeft <= 1) {
        return observable$; // last attempt
      }
      // Return observable that produces this particular effect
      return defaultEffectsErrorHandler(
        observable$,
        errorHandler,
        retryAttemptLeft - 1
      );
    })
  );
}
If you'd like to know why there must a limit regarding the number of retries, here's the issue where this topic is addressed.
When an error occurs, the observable will be unsubscribed. What defaultEffectsErrorHandler does is to allow us to re-subscribe to the just-unsubscribedobservable as long as the maximum number of allowed attempts is not exceeded.

For instance, if you have this effect:

<>
addUser$ = createEffect(
  () => this.actions$.pipe(
    ofType(UserAction.add),
    exhaustMap(u => this.userService.add(u)),
    map(/* Map to action */)
  ),
)
If an error occurs due to calling userService.add() and it is not handled anywhere, like:

<>
// `this.userService.add(u)` is a cold observable
exhaustMap(
  u => this.userService.add(u).pipe(catchError(err => /* Action */))
),
addUser$ will unsubscribe from the actions$ stream. defaultEffectsErrorHandler will simply re-subscribe to actions$, but there's another thing that's worth mentioning: the actions$ stream is actually a Subject so we know for sure that when re-subscribed, we won't receive any of the previously emitted values, only the newer ones.

You can also provide custom error handlers for effects:

<>
{
  provide: EFFECTS_ERROR_HANDLER,
  useValue: customErrHandler,
},

function customErrHandler (obs$, handler) {
  return obs$.pipe(
    catchError((err, caught$) => {
      console.log('caught!')
      
      // Only re-subscribe once
      // return obs$;

      // Re-subscribe every time an error occurs
      return caught$;
    }),
  )
}
where customErrHandler should be a function that accepts an observable$(the observable built on top of the action$ observable) and an errHandler object.

TypeScript's Magic
Now we are going to see the important role that TypeScript plays when it comes to creating effects using createEffect.

Consider this effect:

<>
addUser$ = createEffect(
  () => this.actions$.pipe(/* ... */),
)
The addUser$'s type should be: Observable<Action> & CreateEffectMetadata. CreateEffectMetadata is a way to identify a property created by createEffect(). It is particularly useful when the properties are merged into one single observable.

Before revealing why Observable<Action> is there, let's try writing the same effect, but this time specifying the dispatch: falsein the config object:

<>
addUser$ = createEffect(
  () => of(1),
  { dispatch: false }
)
addUser$'s type will be Observable<number> & CreateEffectMetadata.

But if we have:

<>
addUser$ = createEffect(
  () => of(1),
  // { dispatch: false }
)
we'd get: Type 'number' is not assignable to type 'Action'. What this means is the the dispatch property has an influence on the effect's type.

Let's see how this can be achieved:

<>
// U defaults to `undefined` by default
type DispatchType<T> = T extends { dispatch: infer U } ? U : true;
// `OriginalType` will be used only if the `dispatch` is explicitly set to `false`
type ObservableType<T, OriginalType> = T extends false ? OriginalType : Action;

export function createEffect<
  C extends EffectConfig, // { dispatch?: boolean, useEffectsErrorHandler?: boolean; }
  DT extends DispatchType<C>, // U(undefined | boolean) || true
  OT extends ObservableType<DT, OT>, // If `DT` is false(`dispatch` explicitly set to `false`), use the original type
  R extends Observable<OT> | ((...args: any[]) => Observable<OT>) // Use `OT` to infer the Observable's type
>(source: () => R, config?: Partial<C>) { }
With this in mind, in this snippet

<>
addUser$ = createEffect(
  () => of(1),
  // { dispatch: false }
)
we have(reading from the bottom):

R - Observable<number>
OT - initially is of type number
DT - false as dispatch is explicitly set to false
OT extends ObservableType<DT, OT> determines the final type of OT: false extends false ? number : Action -> we're getting number
Conversely, in this snippet

<>
addUser$ = createEffect(
  () => of(1),
  // { dispatch: false }
)
we have OT extends ObservableType<DT, OT> and it can be seen as undefined extends false ? number : Action. So, the OT's type will be Action, and we're getting the error because addUser$'s type is Observable<number>, when it should've been Observable<Action>.

The
actions$
stream
Throughout the article you might have seen actions$ several times. In this section we're going to find out what it is, what it does and how once again TypeScript ensures a seamless developer experience.

Normally, you'd inject the inject actions$  in an effects class this way:

<>
constructor(private actions$: Actions) {}
<>
export interface Action {
  type: string;
}

@Injectable()
export class Actions<V = Action> extends Observable<V> {
  constructor(@Inject(ScannedActionsSubject) source?: Observable<V>) {
    super();

    if (source) {
      this.source = source;
    }
  }

  lift<R>(operator: Operator<V, R>): Observable<R> {
    const observable = new Actions<R>();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }
}
ScannedActionsSubject comes from @ngrx/store and it is a Subject(thus, an Observable) that emits whenever actions are dispatched, but only after the state changes have been handled. So, when an action is dispatched(Store.dispatch()), the State entity will first update the application state depending on that action and the current state with the help of the reducers, then it will push that action into an actions stream, created by ScannedActionsSubject.

By setting the Actions' source to ScannedActionsSubject, every time we have something like this.actions$.pipe().subscribe(observer) the observer will be part of ScannedActionsSubject's observers list, meaning that when the subject emits an action(e.g: subject.next(action)), all the registered observers will receive it. This should explain why all the effects will receive the same actions, but, with ofType's help, these can be filtered out.

Here's how the ScannedActionsSubject notifies its active observers:

<>
// State
/* ... */
const stateAndAction$: Observable<{
  state: any;
  action?: Action;
}> = withLatestReducer$.pipe(
  scan<[Action, ActionReducer<T, Action>], StateActionPair<T>>(
    reduceState, // Handling state changes
    seed
  )
);

this.stateSubscription = stateAndAction$.subscribe(({ state, action }) => {
  this.next(state); // `state` -> the new state, after reducers have been invoked 
  scannedActions.next(action);
});
ofType
In order to determine which actions should trigger which effects, the ofType custom operator is used:

<>
export function ofType(
  ...allowedTypes: Array<string | ActionCreator<string, Creator>>
): OperatorFunction<Action, Action> {
  return filter((action: Action) =>
    allowedTypes.some(typeOrActionCreator => {
      if (typeof typeOrActionCreator === 'string') {
        // Comparing the string to type
        return typeOrActionCreator === action.type;
      }

      // We are filtering by ActionCreator
      return typeOrActionCreator.type === action.type;
    })
  );
}
As you can see, it internally uses the RxJs filter operator, whose predicate function's return value depends on whether the current emitted action is among the values provided to ofTypeor not.

What's indeed fascinating here is how TypeScript's power is leveraged.

When it comes to ofType's type inference, there are 2 possibilities:

you can provide actions created by createAction(), which complies with the ActionCreator type;
<>
export type ActionCreator<
  T extends string = string,
  C extends Creator = Creator // `Creator` -> a function that returns an object
> = C & TypedAction<T>; // A function that has a readonly property `type`, which also returns an object
By using ofType(action1, action2, ...), its return type will be a union comprised of the return types of action1, action2 and ... actionN:

<>
export function ofType<
  AC extends ActionCreator<string, Creator>[],
  U extends Action = Action, // A created action
  V = ReturnType<AC[number]>

  // `U` - the type of the incoming observable
  // `V` - the type of the returned observable
>(...allowedTypes: AC): OperatorFunction<U, V>;
What we're particularly interested in is the V = ReturnType<AC[number]> part. AC is an array of ActionCreator(results of createAction).
AC[number] will return a union of all the AC's elements. For example:

<>
type Action<T extends string = string> = { readonly type: T; }

function createAction<P extends object, T extends string>(t: T, payload: P): P & Action<T> {
  return {
    ...payload,
    type: t,
  };
}

const actions = [createAction('type1', { name: 'andrei' }), createAction('type2', { age: 123 })];

// `(typeof actions)[number]` -> a union of types
const action: (typeof actions)[number] = {
  // We can discriminate unions with the help of the `type` property
  // because `createAction` returns an object with one `readonly` property,
  // namely `type`
  type: 'type2',
  age: 123,
  // name: 'John' -> ? error
}
Similarly, the union resulted from AC[number] can be discriminated with the type property.

Next, we have ReturnType<Union>. which is the same as ReturnType<Union_M1 | Union_M2 | ...>(where Union_Mn represents the n-thmember of the union). What it does is to determine the return type of each action. This union will be the type of the ofType's returned observable.

you can provide strings that represent actual action types;
However, since all that ofType is getting is a list of strings, in order to infer the right types, you must manually specify a union of types that are expected to match the provided action types.

Let's take a look at one of the overloads of Observable.pipe:

<>
export class Observable<T> implements Subscribable<T> {
  /* ... */
  
  pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
  
  /* ... */
}
where OperatorFunction<T,A> specifies the type of a function that receives an observable as a parameter and returns another observable:

<>
export interface UnaryFunction<T, R> { (source: T): R; }
export interface OperatorFunction<T, R> extends UnaryFunction<Observable<T>, Observable<R>> {}
So, from the above snippets we can notice that the first operator in the pipe function will be a function whose single parameter's type will be an observable of type T(where T is the type parameter for Observable).

With this in mind, let's take a look at the Actions class, which provides a stream of actions depending on which the effects will act:

<>
@Injectable()
export class Actions<V = Action> extends Observable<V> {
  constructor(@Inject(ScannedActionsSubject) source?: Observable<V>) { }
}
Interesting, so Actions<V = Action> is also an Observable<V>, which means that the parameter's type of first operator(function) in the pipe will be of type V.

Let's also have a look at the other ofType's overloads:

<>
export function ofType<
  E extends Extract<U, { type: T1 }>,
  AC extends ActionCreator<string, Creator>,
  T1 extends string | AC,
  U extends Action = Action,
  V = T1 extends string ? E : ReturnType<Extract<T1, AC>>
>(t1: T1): OperatorFunction<U, V>;
Please disregard what's between <> for a moment in order to heed the ofType's return type, along with the type of the first operator in Observable.pipe:

<>
ofType(): OperatorFunction<U, V> <---> pipe<A>(op1: OperatorFunction<T, A>)
What we can deduce from here is that the U type parameter of ofType will be T, namely, V(from Actions<V extends Action> extends Observable<V>).

This is why you'll have to provide a union of actions when you inject the Actions observable in your effects class, otherwise it would be impossible to infer the return types of the actions the effect is interested in. By providing this union, we can now let TypeScript play its part.

<>
export function ofType<
  E extends Extract<U, { type: T1 }>,
  AC extends ActionCreator<string, Creator>,
  T1 extends string | AC,
  U extends Action = Action,
  V = T1 extends string ? E : ReturnType<Extract<T1, AC>>
>(t1: T1): OperatorFunction<U, V>;
So, we've established that U will be the V type(V of the Actions<V = Action>), which, when injected, it will equal to the provided union of actions.
E will be the extracted action, based on the singleton type(the type property). As we know, an action(created by createAction) is a function that has a readonly property called type. This will allow us to infer the real action(which is part of the union V of the injected Actions<V>), because every action extends <{ type: aSingletonType }>.
Finally, the return type will be V(V of ofType), whose value is based on a binary decision:

E(the inferred created action), because T1 is a singleton type which will allow TypeScript to infer the actual action;
Here's an example that mimics this behavior:

<>
// Can be thought of as actions
type A = { type: 'andrei' };
type J = { type: 'john' };
type JA = { type: 'jane' };

// E extends Extract<U, { type: 'andrei' | 'john' | 'jane' }>,
type Names = { type: 'andrei' | 'john' | 'jane' };

// === `createAction('john', props<{ age: number }>())`
type JSub = J & { age: number };
// === `createAction('john', props<{ city: string }>())`
type ASub = A & { city: string };

type R = Extract<ASub | JSub, A | JA | J>;
type R2 = Extract<ASub | JSub, Names>;

// After choosing the value of the `type` property
// the unions will be discriminated
const o: R = { type: 'andrei', city: 'city', };
const o2: R2 = { type: 'john', age: 18 };
TypeScript Playground.

ReturnType<Extract<T1, AC>>, because the value of T1 type is not a string subtype, it must be an action creator, so we only want to get its return type
Connecting
ngrx/effects
with
ngrx/store
Armed with the knowledge from this article and from Understanding the magic behind StoreModule of NgRx (@ngrx/store), we can now visualize what's happening behind the scenes:


Store.dispatch()
It signals that an event that requires state changes is sent from the UI(e.g a smart component). Store.dispatch() will push the action(event) into an actions stream(which is different from the one that belongs to the effects):

<>
// Store
dispatch(action) {
  this.actionsObserver.next(action);
}
What's also worth mentioning here is that the Store class is an observable and its source is the State, which is also an observable, more precisely, a BehaviorSubject:

<>
// Store
constructor(
  state$: StateObservable, // The `State` class
  private actionsObserver: ActionsSubject,
) {
  super();

  this.source = state$;
}    
This is useful because components from the UI layer can simply subscribe to the Store class in order to be updated when state changes occur.

Intercept the action in the State class
<>
// State
constructor(
  actions$: ActionsSubject, // Receive the actions dispatched from `Store`
  reducer$: ReducerObservable,
  scannedActions: ScannedActionsSubject, // The `actions stream` that belong to effects
  @Inject(INITIAL_STATE) initialState: any
) {
  const actionsOnQueue$: Observable<Action> = actions$.pipe(
    observeOn(queueScheduler)
  );
  const withLatestReducer$: Observable<
    [Action, ActionReducer<any, Action>]
  > = actionsOnQueue$.pipe(withLatestFrom(reducer$));

  const seed: StateActionPair<T> = { state: initialState };
  const stateAndAction$: Observable<{
    state: any;
    action?: Action;
  }> = withLatestReducer$.pipe(
    scan<[Action, ActionReducer<T, Action>], StateActionPair<T>>(
      // a)
      reduceState, // Invoke the reducers -> the result will be a new state
      // =====
      seed
    )
  );

  this.stateSubscription = stateAndAction$.subscribe(({ state, action }) => {
    // b)
    this.next(state); // Send the new state to the data consumer(e.g: a smart component)
    // =====

    // c)
    scannedActions.next(action); // Notify effects that an action ocurred
    // =====
  });
}
a): call the reducers with the current action and the current state, resulting a new state
b) send the new state to the data consumers;
Remember that State is the source of Store, meaning that this.next(state); will make state accessible in the Storeclass, which can be subscribed to: Store.select() or Store.pipe(select())
c): after state changes have been handled and sent to the data consumers, send the action to the effects;
If the action is intercepted by any of the registered effects, a new action will arise which will in turn be intercepted by the Store(), causing the steps a), b), c) to be repeated:
<>
this.effectSources
  .toActions() // The action resulted from all the merged effects 
  .subscribe(this.store);
This is possible because the Store can act as a subscriber as well:

<>
// Store
next(action: Action) {
  this.actionsObserver.next(action);
}
That's it, folks! Thanks for reading!