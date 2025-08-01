---
title: "Astro SSG: handling redirects on GitHub Pages"
pubDate: "Jan 6, 2025"
alsoOn: [https://bsky.app/profile/puf.io/post/3lfagk6gbos22, https://www.threads.net/@frankpuf/post/DEkaEs7scKA, https://x.com/puf/status/1877007534780764411, https://c.im/@puf/113793331718758891, https://www.linkedin.com/feed/update/urn:li:activity:7283135579804876800/]
description: "I use Astro to generate a fully static site from content in Markdown files, that I then host on GitHub Pages. I want to provide incoming links/aliases inside my Markdown files, but GitHub Pages doesn't support custom 301 redirect responses. Read the full article to learn how I work around this limitation."
tags: [astro, ssg, http-redirect, github-pages]
---

This site is currently generated with [Astro](https://astro.build/), hosted on [GitHub Pages](https://pages.github.com/), and [deployed](https://github.com/withastro/action) through [GitHub Actions](https://docs.github.com/en/actions). So whenever I push a change to the [puf.io GitHub repo](https://github.com/puf/puf.io), I end up with a completely static site on GitHub pages.

If I make a mistake in my code or markdown, the build fails (<svg style="fill: red" width="16" height="16" style="margin-top: 2px" class="octicon octicon-x-circle-fill color-fg-danger" aria-label="failed: " viewBox="0 0 16 16" version="1.1" role="img"><path d="M2.343 13.657A8 8 0 1 1 13.658 2.343 8 8 0 0 1 2.343 13.657ZM6.03 4.97a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042L6.94 8 4.97 9.97a.749.749 0 0 0 .326 1.275.749.749 0 0 0 .734-.215L8 9.06l1.97 1.97a.749.749 0 0 0 1.275-.326.749.749 0 0 0-.215-.734L9.06 8l1.97-1.97a.749.749 0 0 0-.326-1.275.749.749 0 0 0-.734.215L8 6.94Z"></path></svg>) and the update is not deployed. If the build succeeds (<svg style="fill: rgb(26, 127, 55)" width="16" height="16" class="octicon octicon-check-circle-fill color-fg-success" aria-label="completed successfully: " viewBox="0 0 16 16" version="1.1" role="img"><path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm3.78-9.72a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018L6.75 9.19 5.28 7.72a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042l2 2a.75.75 0 0 0 1.06 0Z"></path></svg>), it deploys the static site to GitHub Pages. I *love* being able to test updates locally and knowing that "nothing" I do, can break the site once it's been deployed.

One of the things I struggled with for a while though was how to handle redirects in this setup. Redirects are a mechanism that allows you to keep existing URLs working if (when?) you move content to a new location; instead of serving 404 Page Not Found for the old URL they send/redirect the user to the new location.

## Astro support for global redirects

[Astro has support for redirects](https://docs.astro.build/en/guides/routing/#redirects) that you configure that through a [`redirects` node](https://docs.astro.build/en/reference/configuration-reference/#redirects) in the global `astro.config.js` file [^1]:
```js
export default defineConfig({
  ...
  redirects: {
    "/old-path": "/new-path",
  }
});
```
Based on this information, Astro will then generate a static file for `old-path` that redirects the user to `new-path` [^2].

Global redirect configuration like this is fine for some use-cases, but for most of my cases I want to configure the redirects as part of my content - in the [frontmatter](https://dev.to/dailydevtips1/what-exactly-is-frontmatter-123g) of my Markdown content pages. Let's have a look at why, and how.

## Storing incoming redirects in each content file

My initial post in the `/socials` category was on July 28, 2024 to the path `/socials/patches-on-patagonia-hoodies`. Soon after publishing that I decided to give social posts a date prefix, so I moved the content to `/socials/2024-07-28 Patches on Patagonia hoodies`. But since the URL without the date prefix was already live, we need to redirect from the old URL to the new one.

I *could* configure a redirect for this in the global config that I showed above, but this type of redirect feels like it should be configured as part of to the content.

I write my content in Markdown files, and added the following to the [YAML frontmatter](https://docs.github.com/en/contributing/writing-for-github-docs/using-yaml-frontmatter) [^3] of the page for the redirect:

```yaml
---
title: Patches on Patagonia hoodies
pubDate: "July 28, 2024"
...
aliases: ["/socials/patches-on-patagonia-hoodies", "/socials/patagonia-patches"]
---

I've been wearing Patagonia hoodies for about a decade now...
...
```

So the `aliases` array [^4] contains the alternative paths on this site through which you can reach the content in this Markdown page. We'll need to generate a redirect from each alias to the URL where this content lives.

## Handling redirects on GitHub Pages (in HTML)

GitHub Pages is a wonderful platform to host static sites, as long as you can work within what it supports. And one of the things is does *not* support is generating a specific HTTP response status code for a request - such as the [HTTP Status Code 301](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301) that indicates a permanent redirect.

Since Astro supports global redirects in SSG already, I decided to use their approach for my use-case too. So I looked up how they [route redirects in SSG](https://github.com/withastro/astro/blob/ebe2aa95c7f4a6559cec8b82d155da34a57bdd53/packages/astro/src/core/routing/3xx.ts#L11-L19) and it turns out they generate:
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

The HTML `body` is there in case a browser doesn't support this `refresh` behavior, but [according to caniuse support is pretty universal](https://caniuse.com/mdn-html_elements_meta_http-equiv_refresh).

➡️ So now we know what aliases we want to generate for a content page, and we know what HTML we need to output for those. All that's left is to bind those two together with some code.

## Generating an additional page/route for each alias

The Markdown content for this site lives in a [`/notes` folder](https://github.com/puf/puf.io/tree/main/notes) *next* to the [Astro `/src` folder](https://github.com/puf/puf.io/tree/main/src) in the Git repo, so I don't depend on Astro's default [static routes handling](https://docs.astro.build/en/guides/routing/#static-routes). 

Instead I have a single [dynamic route](https://docs.astro.build/en/guides/routing/#static-ssg-mode) `/src/pages/[...slug].astro` that exports a `getStaticPaths` function that returns all of the paths for content in the `/notes` folder:
```js
export async function getStaticPaths() {
  return await getNotes();
}
```

The `getNotes` function is a bit involved, but if we strip it down it's pretty much:
```js
export async function getNotes(options?: { keepIf?: (note: any) => boolean }) {
  const notes = await Astro.glob("../../notes/**/*.md");

  let results: any[] = []; // TODO: define type
  for (const note of notes) {
    // Derive info from note
    ...

    results.push({ params: { slug, type, name, pubDate, isDraft }, props: note });
  }

  return results;
}
```

The `slug` in the `params` array matches up with the name of the dynamic page: `/src/pages/[...slug].astro` [^5]. So the above code generates one static path for each `.md` file in my `/notes` folder.

To add handling for aliases, I added the following after the existing `result.push(...)` line:
```js
// add any aliases from the note doc's frontmatter
if (note.frontmatter?.aliases) {
  for (const alias of note.frontmatter.aliases) {
    results.push({ params: { slug: alias }, props: { type: "redirect", redirectTo: slug} });
  }
}
```

So for each value in the `aliases` array of the note, we add another entry to the `results` list that we return from `getStaticPaths`. The string value from the frontmatter is used as the `slug` for that alias, and we then set `redirectTo` to the slug of where the content actually lives.

➡️ This gives us the right number of pages/routes, so "all" that's left to do is generate the HTML that tells the browser to redirect to the content page.

## Routing each alias to the correct page

My `/src/pages/[...slug].astro` handles most content types already. To handle redirects, I added this to the end of the file:

```tsx
{(isRedirect(post) && 
  <>
    <meta http-equiv="refresh" content={`0;url=${post.redirectTo}`} />
    <p>Content was moved to <a href={`${post.redirectTo}`}>{post.redirectTo}</a></p>
  </>
)}
```

So: if the slug is a redirect (based on the props we set earlier) this renders the `refresh` meta-header that we saw before [^6].

---

This post has shown how I handle incoming redirects inside the frontmatter of my Markdown content files here on [puf.io](/). Feedback? Questions? Reach me through the social links at the top of the page.

There is an open feature request to add [Manageable redirects in front-matter (#627)](https://github.com/withastro/roadmap/discussions/627) to Astro directly too, but I didn't feel like waiting.

---

[^1]: Astro *does* support [dynamic redirects](https://docs.astro.build/en/guides/routing/#dynamic-redirects), but [only on dynamically rendered sites (SSR)](https://docs.astro.build/en/reference/errors/static-redirect-not-available/), not statically rendered sites (SSG).
[^2]: If you have a dynamic web server, it'd do this by returning HTTP status code 301. This won't work for GitHub Pages though, as the site is completely static there, but we'll have a look at an alternative solution below.
[^3]: Look at that - I never realized that frontmatter like this is actually YAML. 🤯
[^4]: Now that I know this is YAML, I finally understand why I can use both inline arrays (like here) and the one-item-per-line format. See [How to represent arrays in YAML](https://www.educative.io/answers/how-to-represent-arrays-in-yaml) if this is new to you (too).
[^5]: In fact, the other values should probably be in `props` instead of `params` 😬.
[^6]: Oops, I actually don't return all of the information that Astro itself does. The redirects work, but maybe that's why Google Search Console is still yelling at me. 🤔