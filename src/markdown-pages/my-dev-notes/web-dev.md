---
title: "Web Development Notes"
slug: /my-dev-notes/web-dev-notes
parent: "Dev Notes"
date: 2021-04-29
---

## Resource Hints

<details>
  <summary>Resources</summary>

  * [Robin Drexler - preconnect, prefetch, preload, pre what? An intro to Resource Hints | JSUnconf 2018](https://www.youtube.com/watch?v=6q75MVFLlok)
</details>


* the `crossorigin` attribute could be used when fetching fonts(`crossorigin="anonymous"`, which is the default value, means that **none** of the **identifying headers** will be sent along with the request)

* by using `rel="dns-prefetch preconnect"`, in case the browser supports `preconnect`, it will use that, otherwise, it will use `dns-prefetch`

### preconnect
  * resolves DNS
  * perform TCP handshake
  * setup TLS
  
### dns-prefetch
  * only does DNS lookup(does **not** open the TCP connection)
  * useful if the resource is loaded later

### prefetch
  * download **resources** for a **later use**
  * resources are not executed
  * examples:
    * while being on a login page, the js files & assets that compose the *rest* of the app could be `prefetched` in that time
    * while being on an order page(where you'd inspect the products), you could prefetch the `checkout.js` file(& maybe the assets that are needed)

### preload
  * download resources that are needed for the current navigation
  * you can also use the `media` attribute(for example, you might want to have different images based on the screen size)
  ```html
  <link rel="preload" as="image" type="image/png" href="path-to-image.png" media="(max-width: 320px)">
  ```
