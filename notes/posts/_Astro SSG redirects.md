---
title: "Astro SSG: rendering redirects on GitHub pages"
pubDate: "Jan 20, 2025"
alsoOn: [https://x.com/puf]
description: ""
---

This site is currently generated with Astro and hosted on GitHub pages,  and deployed through GitHub Actions on each commit. So whenever I push a change to [my repo](), Astro generates a completely static site that it then deploys to GitHub pages.

If I make a mistake in my code or markdown, the build fails and the update is not deployed. If the build succeeds, it deploys the static site to GitHub Pages. I *love* being able to test everything locally and knowing that "nothing" I can do, can break the site once it's been deployed.

One of the things I struggled with for a while was how to handle redirects. [Astro has support for redirects](https://docs.astro.build/en/guides/routing/#redirects), but you configure that through a [`redirects` node](https://docs.astro.build/en/reference/configuration-reference/#redirects) in the global `astro.config.js` file [^1]:
```js
export default defineConfig({
  ...
  redirects: {
    "/old-path": "/new-path",
  }
});
```
Global redirect configuration is fine for some use-cases, but for most of my cases I want to configure the redirects in the [frontmatter](https://dev.to/dailydevtips1/what-exactly-is-frontmatter-123g) of my Markdown content pages. Let's have a look at why, and how.

## Storing redirects in the frontmatter of the markdown

I started adding a date-prefix to pages in `/socials`, but hadn't done that for the initial post there. So the initial post was live on slug `/socials/patches-on-patagonia-hoodies`, while for consistency it should be `/socials/2024-07-28 Patches on Patagonia hoodies`. 

I *could* configure a redirect for this in the global config that I showed above, but somehow this type of redirect feels like it belongs closer to the contnet than that.

I write my content in Markdown files, and added the following to the frontmatter of the page for the redirect:

```yaml
---
title: Patches on Patagonia hoodies
pubDate: "July 28, 2024"
...
aliases: ["/socials/patagonia-patches", "/socials/patches-on-patagonia-hoodies"]
---

I've been wearing Patagonia hoodies for about a decade now...
...
```

So I call these aliases here, as they're aliases for the Markdown page where the content exists. We'll need to generate a redirect from each alias to the URL where this content lives.

## How to handle redirects on GitHub Pages

GitHub Pages is a wonderful platform to host static sites, as long as you can work within what it supports. And one of the things is does *not* support is generating a specific HTTP response status code for a request - such as the [HTTP Status Code 301](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301) that indicates a permanent redirect.

I decided to use the same mechanism that Astro uses for its global redirects in SSG for my use-case too, so I looked up what [they do there](https://github.com/withastro/astro/blob/ebe2aa95c7f4a6559cec8b82d155da34a57bdd53/packages/astro/src/core/routing/3xx.ts#L11-L19) [^2]:
```tsx
<!doctype html>
<title>Redirecting to: ${location}</title>
<meta http-equiv="refresh" content="${delay};url=${location}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${location}">
<body>
  <a href="${location}">
    Redirecting from <code>${from}</code> to <code>${location}</code>
  </a>
</body>
```

The main workhorse here is the `<meta http-equiv="refresh" content="${delay};url=${location}">`, which essentially puts the [HTTP refresh header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Refresh) into the HTML, telling the browser to redirect to the new location (with an optional delay).

The HTML is there in case a browser doesn't support this `refresh` behavior, but [according to caniuse support is pretty universal](https://caniuse.com/mdn-html_elements_meta_http-equiv_refresh).

So now we know what aliases we want to generate for a content page, and we know what HTML we need to output for those. All that's left is to bind those two together with some code.


## Routing the aliases to the correct page



---


[^1]: There is also documentation on [dynamic redirects](https://docs.astro.build/en/guides/routing/#dynamic-redirects), but I didn't try those.
[^2]: Oops, I see that actually don't return all of these yet. Maybe that's why Google Search Console is still yelling at me. 🤔