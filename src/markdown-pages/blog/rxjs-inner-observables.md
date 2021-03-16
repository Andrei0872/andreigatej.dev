ADVANCED

ANGULAR
WORKSHOPS

Logo
Learn
Stay connected
Contribute
Angular
React
JavaScript
Our content is free thanks to
Enterprise JavaScript Data Table

RxJS advanced course proposal
The main idea is to add a new section in the advanced course, possibly named A new perspective on RxJS. I'd call it new because it involves a mind shift from the reader's side. Why One of the main goals of this idea is to allow the reader to understand how RxJS really works under the hood. It may sound daunting and hard to achieve, but the beautiful thing about it is that we may only have to provide a strong foundation and the rest can come (almost) naturally. In my opinion, the reader can ge

1 January 1970
2 min read
default
The main idea is to add a new section in the advanced course, possibly named A new perspective on RxJS. I'd call it new because it involves a mind shift from the reader's side.

Why
One of the main goals of this idea is to allow the reader to understand how RxJS really works under the hood. It may sound daunting and hard to achieve, but the beautiful thing about it is that we may only have to provide a strong foundation and the rest can come (almost) naturally.

In my opinion, the reader can get a lot of benefits from this, because when working with complex streams, a good illustration of how an operator works or a good definition might not always come handy or it's not enough. When dealing with such cases, the better the understanding of the internals, the higher the likelihood of finding a good solution.

To be more concrete, this idea aims to expose what's the magic behind RxJS: linked lists (at least from my perspective).


Examples
Basic example
This:

src$.pipe(
  a(),
  b(),
  c(),
).subscribe(() => {})
<>
can be seen as:

<!-- TODO: insert basic.jpg -->


high order observables
This:

src$.pipe(
  a(),
  concatMap(() => src2$.pipe(x(), y()),
  c(),
)
<>
can be seen as

<!-- TODO: insert higher-order.jpg -->

b() is concatMap()


Similarly, we could illustrate operators like `switchMap`, `catchError`, `buffer` etc...

Identifying the linked lists in RxJS' source code
Based on the first diagram(from Basic example), we can now understand how the filter operator works.

This is the relevant snippet:

protected _next(value: T) {
  let result: any;
  try {
    result = this.predicate.call(this.thisArg, value, this.count++);
  } catch (err) {
    this.destination.error(err);
    return;
  }
  if (result) {
    this.destination.next(value);
  }
}
<>
Where _next is the next arrow from the diagram.

So, filter is just another node the list.

Notes
we could have subsection where we could re-create RxJS(just some basic functionalities)
For example:

interface Operator {
  destination?: Operator;
  
  next(v: any): void;
  error(e: any): void;
  complete(): void;
}

const filter = (cb: (v: any) => boolean): Operator => ({
  next (v) {
    const res = cb(v);

    res && this.destination.next(v);
  }

  /* ... */
});

const map = (cb): Operator => ({
  next (v) {
    this.destination.next(v);
  }

  /* ... */
})

/* ... */
<>
we could even go a step further and explain where and how these linked lists(there are 2) are created; e.g one when using pipe()(the observable's one) and one when subscribing(the subscriber's one)

we could illustrate even more complicated scenarios & maybe explain why some bugs occur;

ABOUT THE AUTHOR

author_image
Andrei Gatej
A curious software developer with a passion for solving problems and learning new things.

Logo
About Us
Community
Newsletter
Contribute
2021 © All rights reserved. IN DEPTH DEV, INC.
hello@indepth.dev