# Angular Router: Revealing some interesting facts and features

It is undeniable that the `angular/router` package is full of useful features. In this article, instead of focusing on an a single and precise topic, we're going to look at some interesting facts and features of this package that you might not be aware of. These can range from sorts of comparisons(e.g `relative` vs `absolute` redirects) to nonobvious details(e.g `ActivatedRoute`'s properties; how the URL is set in the browser etc).

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

Lastly, it is worth mentioning that wildcard routes can only reuse `query params`. Positional params are not possible because in order to reuse such params, they first have to find their match in the `path` property and since `'**'` is used, they can't be used any further in `redirectTo`.

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

## How are `ActivatedRoute`'s properties updated

* starting point: https://stackblitz.com/edit/exp-routing-redirect-non-wildcard
* prerequisite: https://andreigatej.dev/blog/angular-router-urlree

```ts
/* 
{ path: 'foo/:id', comp: FooComp }

inside `FooComp`

route.params.subscribe(() => ....)

on `foo/1` -> we'd get { id: 1 }
on `foo/1` -> nothing
on `foo/2` -> we'd get { id: 2 }

create_router_state/createNode()

const value = prevState.value;
value._futureSnapshot = curr.value;
const children = createOrReuseChildren(routeReuseStrategy, curr, prevState);
return new TreeNode<ActivatedRoute>(value, children);

setting `_futureSnapshot` is very imp for the comparison
*/
export function advanceActivatedRoute(route: ActivatedRoute): void {
  if (route.snapshot) {
    const currentSnapshot = route.snapshot;
    const nextSnapshot = route._futureSnapshot;
    route.snapshot = nextSnapshot;
    if (!shallowEqual(currentSnapshot.queryParams, nextSnapshot.queryParams)) {
      (<any>route.queryParams).next(nextSnapshot.queryParams);
    }
    if (currentSnapshot.fragment !== nextSnapshot.fragment) {
      (<any>route.fragment).next(nextSnapshot.fragment);
    }
    if (!shallowEqual(currentSnapshot.params, nextSnapshot.params)) {
      (<any>route.params).next(nextSnapshot.params);
    }
    if (!shallowEqualArrays(currentSnapshot.url, nextSnapshot.url)) {
      (<any>route.url).next(nextSnapshot.url);
    }
    if (!shallowEqual(currentSnapshot.data, nextSnapshot.data)) {
      (<any>route.data).next(nextSnapshot.data);
    }
  } else {
    route.snapshot = route._futureSnapshot;

    // this is for resolved data
    (<any>route.data).next(route._futureSnapshot.data);
  }
}
```

---

## Is it necessary to unsubscribe from ActivatedRoute's properties ?

* https://stackoverflow.com/questions/62254252/angular-observables-never-come-to-completion-handler/62259184#62259184

---

## `paramsInheritanceStrategy` option

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