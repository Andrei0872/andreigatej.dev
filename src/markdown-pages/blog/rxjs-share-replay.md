shareReplay places a ReplaySubject between the data consumers and the data producer. This makes it possible for the data producer to not be required every time a new subscriber comes in, which allows the ReplaySubject to provide its stored data instead.

Understanding shareReplay's possible arguments
bufferSize
the number of values the ReplaySubject should cache
Usage:

shareReplay(bufferSize)
shareReplay({ bufferSize: bufferSize })
windowTime
how many ms should each value be stored for by the ReplaySubject
Usage:

shareReplay(bufferSize, windowTime)
shareReplay({ windowTime: windowTime })
scheduler
acts as a timestamp provider
used in conjunction with windowTime
Usage:

shareReplay(bufferSize, windowTime, scheduler)
shareReplay({ scheduler: scheduler })
refCount
whether or not the data producer should be unsubscribed when there are no more active subscribers
refCount === true: when there are no more active subscribers, the current ReplaySubject will be destroyed and the source will be unsubscribed; thus, when a new subscriber comes in after this, the source will be re-resubscribed and a new ReplaySubject will be used
refCount === false: although there might not be any active subscribers left, the source will not be unsubscribed, meaning that a first new subscriber will receive the stored data according to the other options delineated above.
Usage:

shareReplay({ refCount: boolean })
The differences between shareReplay and publishReplay + refCount
publishReplay + refCount() has the same behavior as shareReplay, with a few exceptions. Its default behavior is to unsubscribe from the source(data producer) if there are no subscribers left and re-subscribe when the first active subscriber registers. A noteworthy thing to mention is the ReplaySubject in use will never be destroyed, the same instance will be used across all the subscriptions and unsubscriptions:

const pureSrc$ = new Observable(s => {
  console.log('SOURCE required!');

  s.next(1);
  s.next(2);
});

const prSrc$ = pureSrc$.pipe(publishReplay(), refCount()); 
const s1 = prSrc$.subscribe(console.log); 
const s2 = prSrc$.subscribe(console.log);
// `SOURCE required!` - first time
// s1: 1 \n 2
// s2: 1 \n 2

s1.unsubscribe();
s2.unsubscribe();

const s3 = prSrc$.subscribe(console.log); 
// `SOURCE required` - second time; 
// s3: 1 \n 2 - because the same ReplaySubject is used
// s3: 1 \n 2 - because the source was re-subscribed
<>
shareReplay({ refCount: true }) differs from publishReplay + refCount() in the way ReplaySubject instances are managed. shareReplay({ refCount: true }) will actually destroy the current ReplaySubject when the source is unsubscribed and will create a new one when re-resubscribing to the source:

const pureSrc$ = new Observable(s => {
  console.log('SOURCE required!');

  s.next(1);
  s.next(2);
});

const rcTrueSrc$ = pureSrc$.pipe(shareReplay({ refCount: true }));

const s1 = rcTrueSrc$.subscribe(console.log);
const s2 = rcTrueSrc$.subscribe(console.log);
// `SOURCE required!` - first time
// s1: 1 \n 2
// s2: 1 \n 2

s1.unsubscribe();
s2.unsubscribe();

const s3 = rcTrueSrc$.subscribe(console.log);
// `SOURCE required!` - second time
// s3: 1 \n 2 - the previous `ReplaySubject` was replaced with a new one
<>
shareReplay({ refCount: false }) will not unsubscribe from the source, although there might not be any active subscribers, meaning that new subscribers will always receive the data stored by the ReplaySubject:

const pureSrc$ = new Observable(s => {
  console.log('SOURCE required!');

  s.next(1);
  s.next(2);
});

const rcFalseSrc$ = pureSrc$.pipe(shareReplay({ refCount: false }));

const s1 = rcFalseSrc$.subscribe(console.log);
const s2 = rcFalseSrc$.subscribe(console.log);
// `SOURCE required!` - first time
// s1: 1 \n 2
// s2: 1 \n 2

s1.unsubscribe();
s2.unsubscribe();

const s3 = rcFalseSrc$.subscribe(console.log);
// s3: 1 \n 2 - the source was **not** re-subscribed and the `ReplaySubject` was **not** destroyed 
<>
[StackBlitz.](https://stackblitz.com/edit/sharereplay-and-publishreplay?file=index.ts)

What happens when the data producer completes/errors?
When this happens, the ReplaySubject will pass along the notification to its registered subscribers, then it will empty out its list of subscribers.

If a new subscriber attempts to register, it will immediately receive the error/complete notification