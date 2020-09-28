---
title: "Demystifying angular/router: what is `RouterScroller` and why is it useful ?"
publication: null
date: 2020-02-14
published: true
slug: /blog/angular-router-urlree
tags: ["angular"]
series: Demystifying angular/router
part: 2
---

The `RouterScroller` entity is a very interesting part of the Angular Router. In this post, we're going to have a look at how it works, what makes its features possible and how it can be configured, depending on the developer's needs.

## How RouterScroller is set up

<!-- TODO: italic -->
Files referenced in this section: [`router_module`](https://github.com/angular/angular/blob/master/packages/router/src/router_module.ts), 

Since the `@angular/router` is a built-in package provided by Angular, is has to go through a process of initialization, in order to make sure everything is set up correctly. In this case, it happens inside a `APP_BOOTSTRAP_LISTENER`'s listener. If we peek at the source code, we can see that the first lines of the function's block are just [`this.injector.get` calls](https://github.com/angular/angular/blob/master/packages/router/src/router_module.ts#L549-L553):

```typescript
const opts = this.injector.get(ROUTER_CONFIGURATION);
const preloader = this.injector.get(RouterPreloader);
const routerScroller = this.injector.get(RouterScroller);
const router = this.injector.get(Router);
const ref = this.injector.get<ApplicationRef>(ApplicationRef);

/* ... */
```

This might seem trivial at first sight, but some of the arguments provided to `this.injector.get` are in fact **factory tokens**, meaning that some piece of logic will run in order to retrieve what has been asked for.

For example, `RouterScroller`(the article's focal point) is defined as follows:

```typescript
{
  provide: RouterScroller,
  useFactory: createRouterScroller,
  deps: [Router, ViewportScroller, ROUTER_CONFIGURATION]
},
```

`createRouterScroller` will simply create an instance of the `RouterScroller` class, based on the `ROUTER_CONFIGURATION` token. This can be seen in the class' constructor:

```typescript
constructor(
    private router: Router,
    public readonly viewportScroller: ViewportScroller, private options: {
      scrollPositionRestoration?: 'disabled'|'enabled'|'top',
      anchorScrolling?: 'disabled'|'enabled'
    } = {}) {
  // Default both options to 'disabled'
  options.scrollPositionRestoration = options.scrollPositionRestoration || 'disabled';
  options.anchorScrolling = options.anchorScrolling || 'disabled';
}
```

Then, after the `Router` is initialized (`Router.initialNavigation`), the `RouterScroller` will be initialized as well, with `RouterScroller.init()`:

```typescript
init(): void {
  // we want to disable the automatic scrolling because having two places
  // responsible for scrolling results race conditions, especially given
  // that browser don't implement this behavior consistently
  if (this.options.scrollPositionRestoration !== 'disabled') {
    this.viewportScroller.setHistoryScrollRestoration('manual');
  }

  this.routerEventsSubscription = this.createScrollEvents();
  this.scrollEventsSubscription = this.consumeScrollEvents();
}
```

The last two lines represent the gist of `RouterScroller`. We are going to explore them in the following section, along with some examples.

---

## How RouterScroller works

```ts
// RouterScroller
// how it works & its capabilities
/* 
on each `NavigationEnd`, it keeps track of the `lastId`(the id of the `NavigationEnd`)

on each `NavigationStart`, it stores the position(window.ScrollX, window.ScrollY) of the last navigation(the one the was before this `NavigationStart` was emitted): store

[lastId] = viewportScroller.getScrollPosition()
if `NavigationStart` was the result of click the forward or the back button(e.g history.back(), or historyForward()), it will contain the `state` object(which belongs to an item from the history stack) and that `state` object contains the `navigationId` of the **previous** navigation
with this `id`, we can get the scroll position of the previous navigation.

*/

it('work', fakeAsync(() => {
  const {events, viewportScroller, router} = createRouterScroller(
      {scrollPositionRestoration: 'disabled', anchorScrolling: 'disabled'});

  router.events
      .pipe(filter(e => e instanceof Scroll && !!e.position), switchMap(p => {
              // can be any delay (e.g., we can wait for NgRx store to emit an event)
              const r = new Subject<any>();
              setTimeout(() => {
                r.next(p);
                r.complete();
              }, 1000);
              return r;
            }))
      .subscribe((e: Scroll) => {
        viewportScroller.scrollToPosition(e.position);
      });

  events.next(new NavigationStart(1, '/a'));
  events.next(new NavigationEnd(1, '/a', '/a'));
  setScroll(viewportScroller, 10, 100);

  events.next(new NavigationStart(2, '/b'));
  events.next(new NavigationEnd(2, '/b', '/b'));
  setScroll(viewportScroller, 20, 200);

  events.next(new NavigationStart(3, '/c'));
  events.next(new NavigationEnd(3, '/c', '/c'));
  setScroll(viewportScroller, 30, 300);

  events.next(new NavigationStart(4, '/a', 'popstate', {navigationId: 1}));
  events.next(new NavigationEnd(4, '/a', '/a'));

  tick(500);
  expect(viewportScroller.scrollToPosition).not.toHaveBeenCalled();

  events.next(new NavigationStart(5, '/a', 'popstate', {navigationId: 1}));
  events.next(new NavigationEnd(5, '/a', '/a'));

  tick(5000);
  expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([10, 100]);
  }));

// you can also set the offset
// useful when scrolling to an **anchor**
export function createRouterScroller(
    router: Router, viewportScroller: ViewportScroller, config: ExtraOptions): RouterScroller {
  if (config.scrollOffset) {
    viewportScroller.setOffset(config.scrollOffset);
  }
  return new RouterScroller(router, viewportScroller, config);
}
```

---

## The connection between Location and Router

* in `Router.initialNavigation()` - listen to `popstate` and `hashchange` events through `Location`
* `Location` - the bridge between `Router` and `LocationStrategy`()
* `Location` - used when setting the browser URL

---

## Router options that concern RouterScroller

* scrollPositionRestoration
* anchorScrolling
* scrollOffset