# Angular Router: Revealing some interesting facts and features

It is undeniable that the `angular/router` package is full of useful features. In this article, instead of focusing on an a single and precise topic, we're going to look at some interesting facts and features of this package that you might not be aware of. These can range from sorts of comparisons(e.g `relative` vs `absolute` redirects) to nonobvious details(e.g `ActivatedRoute`'s properties; how the URL is set in the browser etc).

* this article assumes the reader has some basic knowledge of Angular Router;
* by the end of this article, you should have a better understanding of what this package is capable of and, hopefully, a few questions answered about it

## Relative vs Absolute Redirects

When setting up the route configuration array, we often come across the `redirectTo` property. Although its purpose is defined by its name, it also has a few interesting traits that are worth examining.

The path this property takes in can either be relative or absolute. Before revealing the differences between these 2 options, let's see what configuration we'll be using:

```typescript
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DefaultComponent
  },
  {
    path: 'a/b',
    component: AComponent, // reachable from `DefaultComponent`
    children: [
      {
        // Reached when `redirectTo: 'err-page'` (relative) is used
        path: 'err-page',
        component: BComponent,
      },
      {
        path: '**',
        redirectTo: 'err-page'
      },
    ],
  },
  {
    // Reached when `redirectTo: '/err-page'` is used
    path: 'err-page',
    component: DComponent,
  }
]
```

*A StackBlitz demo can be found [here](https://stackblitz.com/edit/exp-routing-redirect-abs-vs-nonabs-path?file=src%2Fapp%2Fapp.module.ts)*.

With the current option, `redirectTo: 'err-page'`(relative path), the `BComponent` will be used. If we'd change it to `/err-page`, then the `DComponent` should be used. As a generalization, we could say that one of the difference between `redirectTo: 'foo/bar'` and `redirectTo: '/foo/bar'` is that when using an absolute path, the search for the next configuration object will start from the **root**, that is, the first, outermost array of routes. 

```typescript
const routes: Routes = [
  // **STARTS FROM HERE**
  {
    /* ... */
  },
  {
    /* ... */
    children: [
      /* ... */
      {
        path: '**',
        redirectTo: '/err-page'
      },
    ],
  },

  {
    path: 'err-page',
    /* ... */
  }
]
```

Whereas when using a relative path, the search will start from the first route in the array from where the redirect operation has started:

```typescript
const routes: Routes = [
  {
    /* ... */
  },
  {
    /* ... */
    children: [
      // **STARTS FROM HERE**
      /* ... */
      {
        path: '**',
        redirectTo: 'err-page'
      },
    ],
  },

  {
    path: 'err-page',
    /* ... */
  }
]
```

Furthermore, another great feature that absolute redirects have is that they can include named outlets:

```typescript
{
  path: 'a/b',
  component: AComponent,
  children: [
    {
      path: '',
      component: BComponent,
    },
    {
      path: 'c',
      outlet: 'c-outlet',
      component: CComponent,
    },
  ],
},
{
  path: 'd-route',
  redirectTo: '/a/b/(c-outlet:c)'
}
```

*[StackBlitz demo](https://stackblitz.com/edit/exp-routing-redirect-named-outlet?file=src%2Fapp%2Fapp.module.ts)*.

It is worth mentioning that an absolute redirect operation can occur only once during a route transition. 

The `path` property which resides in the same configuration object as the `redirectTo` property poses a few more interesting possibilities. The `path` property can take in a simple string which defines a route path, or `'**'`, making it a wildcard route. This route will match any route it is compared against. Now, let's have a look at the options a non-wildcard route gives us.

Firstly, with a non-wildcard route we can reuse the `query params` and the `positional params`(the params that follow the `:nameOfParam` model) from the current issued URL:

```typescript
const routes: Routes = [
  {
    path: 'a/b',
    component: AComponent,
    children: [
      {
        // Reached when `redirectTo: 'err-page'` (relative) is used
        path: 'err-page',
        component: BComponent,
      },
      {
        path: 'c/:id',
        // foo=:foo - get the value of the `foo` query param that 
        // exists in the URL that against this route
        // it works for relative paths as well: `err-page/:id?errored=true&foo=:foo`
        redirectTo: '/err-page/:id?errored=true&foo=:foo'
      },
    ],
  },
  {
    // Reached when `redirectTo: '/err-page'` is used
    path: 'err-page/:id',
    component: DComponent,
  }
]
```

*[StackBlitz demo](https://stackblitz.com/edit/exp-routing-redirect-non-wildcard?file=src%2Fapp%2Fapp.module.ts).*

In the above snippet, we can see that this pattern is followed
  * `?name=:foo` - the `foo` query param is taken from the actual url
  * `path: 'a/:id'`, `redirectTo: 'err-page/:id'` - the `id` positional param is taken from `a/:id`

And here is how we'd navigate to such route:

```html
<button routerLink="a/b/c/123" [queryParams]="{ foo: 'foovalue' }">...</button>
```

Also, when using a `non-wildcard` path and a `relative` redirect, that extra segments of the URL will be added to the `redirectTo`'s segments

```ts
const routes: Routes = [
  {
    path: 'a/b',
    component: AComponent,
    children: [
      {
        path: 'err-page/test',
        component: BComponent,
      },
      {
        // `redirectTo: '/err-page'` - would lead to errors
        path: 'c',
        redirectTo: 'err-page'
      },
    ],
  },
  
  // this could never be reached from `path: 'c'`
  {
    path: 'err-page/test',
    component: DComponent,
  }
]
```

*Note: This only works for `relative` redirects.*

So, we can reach `BComponent`'s route this way:

```html
<button routerLink="a/b/c/test">...</button>
```

*[StackBlitz demo](https://stackblitz.com/edit/exp-routing-redirect-non-wildcard-relative?file=src%2Fapp%2Fapp.module.ts).*

Things can even get a bit more complicated(and interesting), when we consider `matrix params`(e.g `;k1=v1;k2=v2`) as well. As a side note, `positional params` are those which we explicitly define in the route paths(e.g `/:id`), whereas `matrix params` are taken together with their path. Internally, Angular uses entities such as `UrlSegmentGroup`, `UrlSegment` to achieve its features. If we peek at the [`UrlSegment`'s implementation](https://github.com/angular/angular/blob/master/packages/router/src/url_tree.ts#L209-L212), we can see mentioned matrix params. With this in mind, let's see an example:

```typescript
const routes: Routes = [
  {
    path: 'd/a/:id/e',
    component: DComponent,
  },
  {
    // `redirectTo: '/d/a/:id/e'` would work as well
    path: 'a/:id', 
    redirectTo: 'd/a/:id/e'
  },
]
```

If we start a navigation with

```html
<button [routerLink]="['/a', { p1: 1 }, '1', { p2: 2, p3: 3 }]">...</button>
```

*[StackBlitz demo.](https://stackblitz.com/edit/exp-routing-redirect-non-wildcard-relative-matrix-params?file=src%2Fapp%2Fapp.module.ts)*

the `DComponent`'s route will be activated and will end up having this URL: `.../d/a;p1=1/1;p2=2;p3=3/e`

First of all, `['a/path', { p1, p2, p3 }]` is the way to pass matrix params to a segment. The matrix params will be bound to the precedent path. Then, as we've learnt from the previous paragraphs, we can use positional params that are present in the current route in the `redirectTo` path. The important thing to notice is that the matrix params of a given segment will be preserved in the new navigation's path, if used in `redirectTo`.

Lastly, it is should be mentioned that wildcard routes can only reuse `query params`. Positional params are not possible because in order to reuse such params, they first have to find their match in the `path` property and since `'**'` is used, they can't be used any further in `redirectTo`.

Here's is a [StackBlitz demo](https://stackblitz.com/edit/exp-routing-redirect-wilcard-queryparams?file=src/app/app.module.ts) that illustrates how to reuse query params in a wildcard route.

---

## Router.navigate vs Router.navigateByUrl

Although they both have the same purpose, to start a new navigation, they also have a few dissimilarities. Before revealing them, it's important to know that Angular Router operates on a `UrlTree` in order perform the navigation. A `UrlTree` can be thought of a deserialized version of a URL(a string).

`navigate()` will create the `UrlTree` needed for the navigation based on the current `UrlTree`. This might be a bit tricky to use, since in some cases it is needed to provide the `relativeTo` route as well: `navigate(commandsArray, { relativeTo: ActivatedRouteInstance })`. If the `relativeTo` option is not specified, the root `ActivatedRoute` will be chosen.

The `navigateByUrl()` method will create a new `UrlTree`, regardless of the current one.

If you'd like to play around with some examples, you can find them in this [StackBlitz demo](https://stackblitz.com/edit/exp-routing-replace?file=src%2Fapp%2Fcomponents%2Fb.component.ts)

---

## How is the URL set in the browser ?

Under the hood, Angular Router simply uses the native [history API](https://developer.mozilla.org/en-US/docs/Web/API/History). For example, when navigating to a new route, `/user/:id`, the `history.pushState` method is invoked. Similarly, it uses `history.replaceState` when navigating to the same path or when the `replaceUrl` option is set to `true`.

Here's a [StackBlitz demo](https://stackblitz.com/edit/exp-routing-replace-state?file=src%2Fapp%2Fapp.module.ts) that demonstrates the behavior that can be achieved with the `replaceUrl` option.

<!-- GIF -->

---

## The skipLocationChange option

What this options does is to ensure that the `Router`'s method which is responsible for setting the browser's URL, thus adding items to the history's stack, will not be called. However, the `Router`'s internal status will be updated accordingly(e.g route params, query params, anything that can be `observed` from `ActivatedRoute`).

Here you can find a [StackBlitz demo](https://stackblitz.com/edit/exp-routing-skiplocationchange?file=src%2Fapp%2Fcomponents%2Fa.component.ts). 

<!-- GIF -->

As you can see, because this option is used, the `/d` will not even be shown in the address bar. Despite this, the `/d` route's component (`DComponent`) will be loaded.


---

## The hierarchy created by the RouterOutlet directive

An Angular Router's fundamental unit is the `RouterOutlet` directive(identifiable as `router-outlet`). Without it, it would not be possible to actually show something in the browser. But, as we've seen while building Angular applications, it's not rare the case when we end up having nested `router-outlet`tags. Speaking of that, let's assume we have a route configuration like this:

```typescript
// in order to be able to see the `BarComponent`'s view, we'd need to have 2 `router-outlet`
// 1 in `app.component.html` -> needed to render `FooComponent`
// 1 in `foo.component` -> needed to render `BarComponent`

const routes = [
  {
    path: 'foo',
    component: FooComponent,
    children: [
      { path: 'bar/:id', component: BarComponent }   
    ]
  }
];
```

and let's also assume that we inject `ActivatedRoute` inside `BarComponent`, have you ever wondered why, when navigating to `foo/bar/123`, the `ActivatedRoute` instance is the _correct_ one(e.g it exposes the `params`, `queryParams` that are related to `bar/:id` route)? It's again an important detail that's handled by the `RouterOutlet` directive. In this section, we're going to explore how is this achieved(**hint**: it involves creating a custom injector).

Let's consider a simple scenario - we have a route configuration like this:

```typescript
// app.module.ts
const routes = [
  {
    path: 'foo',
    component: FooComponent,
  }
]
```

And now, in order to be able to see the rendered view on `/foo`, we need to insert the `router-outlet` _tag_ in `app.component.html`

```html
<button routerLink="/foo">Go to /foo route</button>

<router-outlet></router-outlet>
```

This is where things start to get interesting. Let's see what the [first steps of initialization](https://github.com/angular/angular/blob/master/packages/router/src/directives/router_outlet.ts#L71-L77) are:

```typescript
constructor(
    private parentContexts: ChildrenOutletContexts, private location: ViewContainerRef,
    private resolver: ComponentFactoryResolver, @Attribute('name') name: string,
    private changeDetector: ChangeDetectorRef) {
  // in case we're using named outlet, we provide the `name` property
  // as we can see, it defaults to `PRIMARY_OUTLET`(`primary`)
  this.name = name || PRIMARY_OUTLET;
  parentContexts.onChildOutletCreated(this.name, this);
}
```

We can already see something which is not that common: `ChildrenOutletContexts`. Let's see [what it is about](https://github.com/angular/angular/blob/master/packages/router/src/router_outlet_context.ts#L33):

```typescript
export class ChildrenOutletContexts {
  // contexts for child outlets, by name.
  private contexts = new Map<string, OutletContext>();

  /** Called when a `RouterOutlet` directive is instantiated */
  onChildOutletCreated(childName: string, outlet: RouterOutlet): void {
    const context = this.getOrCreateContext(childName);
    context.outlet = outlet;
    this.contexts.set(childName, context);
  }
  /* ... */

  getOrCreateContext(childName: string): OutletContext {
    let context = this.getContext(childName);

    if (!context) {
      context = new OutletContext();
      this.contexts.set(childName, context);
    }

    return context;
  }

  getContext(childName: string): OutletContext|null {
    return this.contexts.get(childName) || null;
  }
}

export class OutletContext {
  outlet: RouterOutlet|null = null;
  route: ActivatedRoute|null = null;
  resolver: ComponentFactoryResolver|null = null;
  children = new ChildrenOutletContexts();
  attachRef: ComponentRef<any>|null = null;
}
```

So, when any `RouterDirective` is created, it will right away invoke `ChildrenOutletContexts.onChildOutletCreated()`. Then, we either reuse an existing _context_(we'll see an example a bit later) or we create a new one, which is the current situation. We've introduced the _context_ concept and it can be accurately described by the `OutletContext`. An interesting thing to notice here is that a _context_ has a `children` property, which points `ChildrenOutletContexts`. What this means is that we can visualize this process as a tree of _contexts_, more exactly a tree of `OutletContext` instances.

What you might wonder now is why the `ChildrenOutletContexts` class needs to maintains a map of `OutletContext`s:

```typescript
private contexts = new Map<string, OutletContext>();
```

Even if this question didn't not immediately come to mind, it's a question that's worth asking. To answer this, let's recall that we can also have **named outlets**. So, what would the `context` `Map` instance look like if we would add these? :

```typescript
const routes = [
  {
    path: 'foo',
    component: FooComponent,
  },
  {
    path: 'bar',
    component: BarComponent,
    outlet: 'named-bar'
  }
]
```

```html
<!-- app.component.html -->
<button routerLink="/foo">Go to /foo route</button>
<button [routerLink]="[{ outlets: { named-bar: bar } }]">Go to /bar route - named outlet</button>

<router-outlet></router-outlet>
<router-outlet name="named-bar"></router-outlet>
```

This time, the _main_ `ChildrenOutletContexts` class will have its `onChildOutletCreated` called twice, each time a new `OutletContext` will be created. So, the `context` will be as follows:

```typescript
{
  primary: OutletContext,
  'named-bar': OutletContext
}
```

If we were to use the `tree`'s parlance, we'd say that the `context` map represents a **level** of a tree and each of its values would go one level deeper.

Let's sharpen this newly learned concept with a help of a [StackBlitz demo](https://stackblitz.com/edit/exp-routing-router-outlet?file=src%2Fapp%2Fapp.module.ts), with the help of which we'll be able to see that this hierarchy is about:

<!-- TODO: embed https://stackblitz.com/edit/exp-routing-router-outlet?file=src%2Fapp%2Fapp.module.ts -->

You can visualize it by checking the console's output after clicking the initial button. This might also serve as a debugging technique in case something seems to not go right with your routes.

Now that are more familiar with the `RouterOutlet`'s hierarchy, we can now find out what makes possible the `ActivatedRoute` to be scoped to a certain route. 

[At the end](https://github.com/angular/angular/blob/master/packages/router/src/directives/router_outlet.ts#L173) of the file where `RouterOutlet` is implemented, there is something that's worth some attention:

```typescript
class OutletInjector implements Injector {
  constructor(
      private route: ActivatedRoute, private childContexts: ChildrenOutletContexts,
      private parent: Injector) {}

  get(token: any, notFoundValue?: any): any {
    if (token === ActivatedRoute) {
      return this.route;
    }

    if (token === ChildrenOutletContexts) {
      return this.childContexts;
    }

    return this.parent.get(token, notFoundValue);
  }
}
```

If we take a look at how `RouterOutlet` renders something to the screen, we'd see how `OutletInjector` is used:

```typescript
const injector = new OutletInjector(activatedRoute, childContexts, this.location.injector);
// this.location - `ViewContainerRef`
this.activated = this.location.createComponent(factory, this.location.length, injector);
```

This is what allows us to always get the proper `ActivatedRoute`, when required. When a component injects `ActivatedRoute`, it will look up the injector tree until it finds the first occurrence of the token. The _scope_ is actually created when `RouterOutlet` creates a new view. As we can see in `OutletInjector`'s implementation, when the `ActivatedRoute` token is required, it will provide the _activatedRoute_ that was received when the injector was created.

---

## Is it necessary to unsubscribe from ActivatedRoute's properties ?

The short answer is **no**.

[Here's](https://github.com/angular/angular/blob/master/packages/router/src/create_router_state.ts#L76-L80) how an `ActivatedRoute` is created:

```typescript
function createActivatedRoute(c: ActivatedRouteSnapshot) {
  return new ActivatedRoute(
      new BehaviorSubject(c.url), new BehaviorSubject(c.params), new BehaviorSubject(c.queryParams),
      new BehaviorSubject(c.fragment), new BehaviorSubject(c.data), c.outlet, c.component, c);
}
```

Assuming you have a configuration that looks like this:

```typescript
{
  path: 'a/:id',
  component: AComponent,
  children: [
    {
      path: 'b',
      component: BComponent,
    },
    {
      path: 'c',
      component: CComponent,
    },
  ]
}
```

and an issued URL like `a/123/b`

you'd end up having a **tree** of `ActivatedRoute`s:

```
 APP
  |
  A
  |
  B
```

Whenever you schedule a navigation(e.g `router.navigateToUrl()`), the router has to go through some important phases:

* **apply redirects**: checking for redirects, loading lazy-loaded modules, finding `NoMatch` errors
* **recognize**: creating the `ActivatedRouteSnapshot` tree
* **preactivation**: comparing the resulted tree with the current one; this phase also _collects_ `canActivate` and `canDeactivate` guards, based on the differences found
* **running guards**
* **create router state**: where `ActivatedRoute` tree is created
* **activating the routes**: this is the cherry on the cake and the place where the `ActivatedRoute` tree is leveraged
  
It is also important to mention the role that `router-outlet` plays.

As it has been described in the previous section, Angular keeps track of the `router-outlet`s with the help of a `Map` object.

So, for our route configuration:

```typescript
{
  path: 'a/:id',
  component: AComponent,
  children: [
    {
      path: 'b',
      component: BComponent,
    },
    {
      path: 'c',
      component: CComponent,
    },
  ]
}
```

the `RouterOutlet`'s contexts `Map` would look like this(roughly):

```typescript
{
  primary: { // Where `AComponent` resides [1]
    children: {
      // Here `AComponent`'s children reside [2]
      primary: { children: { /* ... */ } }
    }
  }
}
```

When a `RouterOutlet` is activated(it is about to render something), its [`activateWith`](https://github.com/angular/angular/blob/master/packages/router/src/directives/router_outlet.ts#L132-L149) method will be called. We've seen in the previous section that this is the place where the `OutletInjector` is created, which is what provides the scope for `ActivatedRoute`s:

```typescript
activateWith(activatedRoute: ActivatedRoute, resolver: ComponentFactoryResolver|null) {
  if (this.isActivated) {
    throw new Error('Cannot activate an already activated outlet');
  }

  this._activatedRoute = activatedRoute;
    
  /* ... */

  const injector = new OutletInjector(activatedRoute, childContexts, this.location.injector);
  this.activated = this.location.createComponent(factory, this.location.length, injector);
}
```

Note that `this.activated` holds the **routed component**(e.g `AComponent`) and `this._activatedRoute` holds the `ActivatedRoute` for this component.

Let's see now [what happens](https://github.com/angular/angular/blob/master/packages/router/src/operators/activate_routes.ts#L109-L126) when we're navigating to another route and the current view is destroyed:

```typescript
deactivateRouteAndOutlet(
    route: TreeNode<ActivatedRoute>, parentContexts: ChildrenOutletContexts): void {
  const context = parentContexts.getContext(route.value.outlet);

  if (context) {
    const children: {[outletName: string]: any} = nodeChildrenAsMap(route);
    
    // from this we can also deduce that a component requires an additional `router-outlet` in this template
    // if it is part of route config. object where there is also a `children`/`loadChildren` property
    // the `route`'s `children` can also refer the routes obtained after loading a lazy module
    const contexts = route.value.component ? context.children : parentContexts;

    // Deactivate children first
    forEach(children, (v: any, k: string) => this.deactivateRouteAndItsChildren(v, contexts));

    if (context.outlet) {
      // Destroy the component
      context.outlet.deactivate();
      // Destroy the contexts for all the outlets that were in the component
      context.children.onOutletDeactivated();
    }
  }
}
```

where `RouterOutlet.deactivate()` looks [like this](https://github.com/angular/angular/blob/master/packages/router/src/directives/router_outlet.ts#L122-L130):

```typescript
deactivate(): void {
  if (this.activated) {
    const c = this.component;
    this.activated.destroy(); // Destroying the current component
    this.activated = null;
    // Nulling out the activated route - so no `complete` notification
    this._activatedRoute = null;
    this.deactivateEvents.emit(c);
  }
}
```

Notice that `this._activatedRoute = null;`, which means there is no need to unsubscribe from `ActivatedRoute`'s observable properties. That's because these properties are `BehaviorSubject`s and, as we know, a `Subject` type maintains a list of subscribers. The memory leak may occur when the subscriber has not _removed itself_ from the list(it can remote itself by using `subscriber.unsubscribe()`). But when the entity that holds everything(in this case the list of subscribers) is nulled out, it can be garbage collected, since it's no longer referenced, meaning that the subscriber which has not unsubscribed can non longer be invoked.

---

## `paramsInheritanceStrategy` option

* not only `params`, but also the `data` values

```ts
/* 
`paramsInheritanceStrategy: 'emptyOnly'|'always' = 'emptyOnly';`

if route config obj has `path: ''` | the parent route has a componentless route -> it will inherit `data` and `params` from the parent 
*/
const fixture = createRoot(router, RootCmpWithTwoOutlets);
router.resetConfig([{
  path: 'parent/:id',
  data: {one: 1},
  resolve: {two: 'resolveTwo'},
  children: [
    {path: '', data: {three: 3}, resolve: {four: 'resolveFour'}, component: RouteCmp}, {
      path: '',
      data: {five: 5},
      resolve: {six: 'resolveSix'},
      component: RouteCmp,
      outlet: 'right'
    }
  ]
}]);

router.navigateByUrl('/parent/1');
advance(fixture);

const primaryCmp = fixture.debugElement.children[1].componentInstance;
const rightCmp = fixture.debugElement.children[3].componentInstance;

expect(primaryCmp.route.snapshot.data).toEqual({one: 1, two: 2, three: 3, four: 4});
expect(rightCmp.route.snapshot.data).toEqual({one: 1, two: 2, five: 5, six: 6});
```

```ts
// worth a visualization! :)
// + `inheritedParamsDataResolve`
inheritParamsAndData(routeNode: TreeNode<ActivatedRouteSnapshot>): void {
  const route = routeNode.value;

  const i = inheritedParamsDataResolve(route, this.paramsInheritanceStrategy);
  route.params = Object.freeze(i.params);
  route.data = Object.freeze(i.data);

  routeNode.children.forEach(n => this.inheritParamsAndData(n));
}
```

```ts
// `data`
// `paramsInheritanceStrategy`
// (!) could include such comparison in `features of angular/router`
 checkRecognize(
[{
  path: 'a',
  data: {one: 1},
  children: [{path: 'b', data: {two: 2}, component: ComponentB}]
}],
'a/b', (s: RouterStateSnapshot) => {
  const r: ActivatedRouteSnapshot =
      (s as any).firstChild(<any>(s as any).firstChild(s.root))!;
  // because the parent is a componentless route
  expect(r.data).toEqual({one: 1, two: 2});
});

// example where the parent is **not** a componentless route
// assuming `paramsInheritanceStrategy: 'empty'`
// if set on `always` - it will inherit from the parent as well
checkRecognize(
[{
  path: 'a',
  component: ComponentA,
  data: {one: 1},
  children: [{path: 'b', data: {two: 2}, component: ComponentB}]
}],
'a/b', (s: any /* RouterStateSnapshot */) => {
  const r: ActivatedRouteSnapshot = s.firstChild(<any>s.firstChild(s.root))!;
  expect(r.data).toEqual({two: 2});
});

// could also include this in `params` section
it('should inherit params', () => {
  checkRecognize(
      [{
        path: 'a',
        component: ComponentA,
        children:
            [{path: '', component: ComponentB, children: [{path: '', component: ComponentC}]}]
      }],
      '/a;p=1', (s: RouterStateSnapshot) => {
        checkActivatedRoute((s as any).firstChild(s.root)!, 'a', {p: '1'}, ComponentA);
        checkActivatedRoute(
            (s as any).firstChild((s as any).firstChild(s.root)!)!, '', {p: '1'}, ComponentB);
        checkActivatedRoute(
            (s as any).firstChild((s as any).firstChild((s as any).firstChild(s.root)!)!)!,
            '', {p: '1'}, ComponentC);
      });
});

checkRecognize(
[{
  path: 'p/:id',
  children: [{
    path: 'a/:name',
    children: [
      {path: 'b', component: ComponentB, children: [{path: 'c', component: ComponentC}]}
    ]
  }]
}],
'p/11/a/victor/b/c', (s: RouterStateSnapshot) => {
  const p = (s as any).firstChild(s.root)!;
  checkActivatedRoute(p, 'p/11', {id: '11'}, undefined!);

  const a = (s as any).firstChild(p)!;
  checkActivatedRoute(a, 'a/victor', {id: '11', name: 'victor'}, undefined!);

  const b = (s as any).firstChild(a)!;
  checkActivatedRoute(b, 'b', {id: '11', name: 'victor'}, ComponentB);

  const c = (s as any).firstChild(b)!;
  checkActivatedRoute(c, 'c', {}, ComponentC);
});
```

---

## `queryParamsHandling`

* show _tip_ on how to reuse the same view(without reloading the page), but with different `queryParams`

```ts
it('should update hrefs when query params or fragment change', fakeAsync(() => {
      @Component({
        selector: 'someRoot',
        template:
            `<router-outlet></router-outlet><a routerLink="/home" preserveQueryParams preserveFragment>Link</a>`
      })
      class RootCmpWithLink {
      }
      TestBed.configureTestingModule({declarations: [RootCmpWithLink]});
      const router: Router = TestBed.inject(Router);
      const fixture = createRoot(router, RootCmpWithLink);

      router.resetConfig([{path: 'home', component: SimpleCmp}]);

      const native = fixture.nativeElement.querySelector('a');

      router.navigateByUrl('/home?q=123');
      advance(fixture);
      expect(native.getAttribute('href')).toEqual('/home?q=123');

      router.navigateByUrl('/home?q=456');
      advance(fixture);
      expect(native.getAttribute('href')).toEqual('/home?q=456');

      router.navigateByUrl('/home?q=456#1');
      advance(fixture);
      expect(native.getAttribute('href')).toEqual('/home?q=456#1');
    }));

// `merge` strategy
@Component({
  selector: 'someRoot',
  template:
    `<router-outlet></router-outlet><a routerLink="/home" [queryParams]="{removeMe: null, q: 456}" queryParamsHandling="merge">Link</a>`
})
class RootCmpWithLink {
}
TestBed.configureTestingModule({declarations: [RootCmpWithLink]});
const router: Router = TestBed.inject(Router);
const fixture = createRoot(router, RootCmpWithLink);

router.resetConfig([{path: 'home', component: SimpleCmp}]);

const native = fixture.nativeElement.querySelector('a');

router.navigateByUrl('/home?a=123&removeMe=123');
advance(fixture);
expect(native.getAttribute('href')).toEqual('/home?a=123&q=456');
```

---

## What happens when a route transition fails ? 

* what does it mean _to fail_ ?
  * route guard returned `false`
  * error occurred - can't find a match

```ts
/* 
if the guard checks do not pass, the route navigation will simply return false and the current URL will remain intact

`this.resetUrlToCurrentUrlTree();`
*/
const fixture = createRoot(router, RootCmp);

router.resetConfig([
  {path: 'one', component: SimpleCmp},
  {path: 'two', component: SimpleCmp, canActivate: ['alwaysFalse']}
]);

router.navigateByUrl('/one');
advance(fixture);
expect(location.path()).toEqual('/one');

location.go('/two');
advance(fixture);
expect(location.path()).toEqual('/one');
```

---

## How to specify when guards and resolvers should run

```ts
function configureRouter(router: Router, runGuardsAndResolvers: RunGuardsAndResolvers):
    ComponentFixture<RootCmpWithTwoOutlets> {
  const fixture = createRoot(router, RootCmpWithTwoOutlets);

  router.resetConfig([
    {
      path: 'a',
      runGuardsAndResolvers,
      component: RouteCmp,
      canActivate: ['guard'],
      resolve: {data: 'resolver'}
    },
    {path: 'b', component: SimpleCmp, outlet: 'right'}, {
      path: 'c/:param',
      runGuardsAndResolvers,
      component: RouteCmp,
      canActivate: ['guard'],
      resolve: {data: 'resolver'}
    },
    {
      path: 'd/:param',
      component: WrapperCmp,
      runGuardsAndResolvers,
      children: [
        {
          path: 'e/:param',
          component: SimpleCmp,
          canActivate: ['guard'],
          resolve: {data: 'resolver'},
        },
      ]
    }
  ]);

  router.navigateByUrl('/a');
  advance(fixture);
  return fixture;
}

export type RunGuardsAndResolvers =
    'pathParamsChange'|'pathParamsOrQueryParamsChange'|'paramsChange'|'paramsOrQueryParamsChange'|
    'always'|((from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot) => boolean);

// `paramsChange` - matrix params changed (default)
 const fixture = configureRouter(router, 'paramsChange');

const cmp: RouteCmp = fixture.debugElement.children[1].componentInstance;
const recordedData: any[] = [];
cmp.route.data.subscribe((data: any) => recordedData.push(data));

expect(guardRunCount).toEqual(1);
expect(recordedData).toEqual([{data: 0}]);

router.navigateByUrl('/a;p=1');
advance(fixture);
expect(guardRunCount).toEqual(2);
expect(recordedData).toEqual([{data: 0}, {data: 1}]);

router.navigateByUrl('/a;p=2');
advance(fixture);
expect(guardRunCount).toEqual(3);
expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}]);

// would've changed if `paramsOrQueryParamsChange`
router.navigateByUrl('/a;p=2?q=1');
advance(fixture);
expect(guardRunCount).toEqual(3);
expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}]);

// `pathParamsChange` - a/1 !== a/2
// Changing any optional params will not result in running guards or resolvers
router.navigateByUrl('/a;p=1');
advance(fixture);
expect(guardRunCount).toEqual(1);
expect(recordedData).toEqual([{data: 0}]);

router.navigateByUrl('/a;p=2');
advance(fixture);
expect(guardRunCount).toEqual(1);
expect(recordedData).toEqual([{data: 0}]);

// `pathParamsOrQueryParamsChange`
// Changing matrix params will not result in running guards or resolvers
router.navigateByUrl('/a;p=1');
advance(fixture);
expect(guardRunCount).toEqual(1);
expect(recordedData).toEqual([{data: 0}]);

router.navigateByUrl('/a;p=2');
advance(fixture);
expect(guardRunCount).toEqual(1);
expect(recordedData).toEqual([{data: 0}]);

// Adding query params will re-run guards/resolvers
router.navigateByUrl('/a;p=2?q=1');
advance(fixture);
expect(guardRunCount).toEqual(2);
expect(recordedData).toEqual([{data: 0}, {data: 1}]);

// `(from, to) => to.paramMap.get('p') === '2'` - a predicate fn
```

---

* `pathMatch` property: https://stackoverflow.com/questions/62850709/nested-routing-in-angular/62854244#62854244
* plus
  ```typescript
  // issuing `/foo` -> will go to the right route
  const routes = [
    {
      path: '',
      component: /* ... */,
    },
    {
      path: 'foo',
      component: /* ... */
    }
  ]
  ```


FRESH: https://stackblitz.com/edit/exp-routing-router-outlet-fvdwjd?file=src%2Fapp%2Fapp.module.ts