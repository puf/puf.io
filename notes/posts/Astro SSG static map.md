---
title: "Adding a static map to a statically rendered Astro site"
pubDate: "Feb 5, 2025"
alsoOn: [https://www.threads.net/@frankpuf/post/DFvZiPIsUNf, https://x.com/puf/status/1887561649021727093, https://bsky.app/profile/puf.io/post/3lhjnzoq55c2j, https://c.im/@puf/113958239924789047, https://www.linkedin.com/feed/update/urn:li:activity:7293327410945564676/]
description: "Posts on puf.io/socials are often linked to a specific location. This article describes how we include this geo-information in the (frontmatter of the) markdown of each post, how we then generate a static map for recent posts (with the Google Maps Static API), and how this process is integrated into Astro's static site generation (SSG) with GitHub Actions and deployed to GitHub Pages. Read the full article to learn more..."
tags: [astro, ssg, google-maps, map, static-map]
---

I recently realized that most of the posts on [`puf.io/socials`](/socials) are about places in San Francisco, and that **it would be nice to show those locations on a map**.

Here's a screenshot of what I want, and what we'll build below:

*This is a screenshot, so you can't click things 👇*
![A list of events and activities in San Francisco with dates ranging from October 16, 2024, to February 1, 2025. The list includes attractions such as a Year of the Snake sculpture in Union Square, the Light Crawler installation at LUMA Hotel, a Peter Pan panto in the Presidio, and historic streetcars on the F line. Below the list, there is a Google Maps screenshot marking the locations of these events across San Francisco, including landmarks like Fisherman’s Wharf, Union Square, and the Mission District.](https://i.imgur.com/xm5jead.png)
*End of screenshot*

The map in the above screenshot is a static PNG and the pins/labels are based on geo-locations in the posts above it. The PNG gets generated when the site is builtm abd then included with the static assets of the site, like any other (pre-existing or generated) static asset. 

This rest of this article describes how I added the location metadata to the content, and how I then render a static map for those locations whenever the site gets rebuilt.

---

## Adding geolocation data to each post

I decided to store the geolocation data for each post in the markdown file of that post, so that all information is in one place. Since my [markdown files][repo-notes] already have a frontmatter YAML section, it was easy to add the geolocation like [this][repo-snake-md]:

```yaml
---
...
location: [37.788185, -122.408212] 
---
...
```

Some of the posts are about more than one location, so the frontmatter can also have a list of locations like [this][repo-streetcar-md] [^1]:
```
---
...
locations:
  - [37.7625625,-122.4373874]
  - [37.795471, -122.393723]
  - [37.8071891,-122.4243766]
---
...
```

With the geolocations in place, let's move on to how to render it into a map image.

[repo-notes]: https://github.com/puf/puf.io/tree/ca539b16edf7da1904de7b85dcc1d0b40029d02e/notes
[repo-snake-md]: https://raw.githubusercontent.com/puf/puf.io/ca539b16edf7da1904de7b85dcc1d0b40029d02e/notes/socials/2025-02-01%20Year%20of%20the%20Snake%20sculpture%20on%20Union%20Square.md
[repo-streetcar-md]: https://raw.githubusercontent.com/puf/puf.io/ca539b16edf7da1904de7b85dcc1d0b40029d02e/notes/socials/2024-12-15%20Historic%20street%20cars%20on%20the%20F%20line.md

---

## Rendering a map at build time with Google Maps

As I described in [Astro SSG: handling redirects on GitHub Pages][redirects] this site runs as a [statically generated Astro site (Astro SSG) on GitHub Actions][astro-github-actions]. So whenever I merge a change into the [GitHub repo][repo], the content and code are converted into static HTML (and assets), which is then deployed to GitHub Pages.

I want the map to also be a static image in the deployed site; almost like the screenshots of Google Maps that I include in many of the posts, but then generated automatically at build time rather than manually grabbed when I author the content. 

After a quick investigation, I decided to use the [Google Maps Static API][google-maps-static-api]. With this API you pass all the necessary information in via URL parameters, and it then returns you a (PNG or other format) image of the rendered map.

In fact, here's the URL that generated the map in the screenshot above:
```
https://maps.googleapis.com/maps/api/staticmap?
  size=800x600&
  maptype=roadmap&
  key=<secret 🤫>&
  markers=label:1%7C37.788185,-122.408212&
  markers=label:2%7C37.775,-122.39022&
  markers=label:3%7C37.7988741,-122.4631458&
  markers=label:4%7C37.8087408,-122.4187566&
  markers=label:5%7C37.7625625,-122.4373874%7C37.795471,-122.393723%7C37.8071891,-122.4243766&
  markers=label:6%7C37.7575716,-122.3921634%7C37.7554186,-122.3892222
```

I hope it's pretty readable and self-explanatory (especially once you realize the %7C is a `|` symbol). The dynamic bit is in the `markers` parameters. There's one of those for each post that has a geo-location. The label is the index of the post, and there are then one of more (`|`/`%7C` separated) lat/lon pairs for that pin/label.

I generate the URL with this bit of JavaScript code in the frontmatter of the [Astro component that generates my index pages][repo-index-page] (so /socials, /posts, and /books) [^2]:
```javascript
let locationString = '';
notes.slice(0, 9).forEach((note, index) => {
  if (note.props.frontmatter?.location) {
    locationString += `&markers=label:${index+1}%7C${note.props.frontmatter.location.join(',')}`;
  }
  if (note.props.frontmatter?.locations) {
    locationString += `&markers=label:${index+1}%7C${note.props.frontmatter.locations.map(l=>l.join(',')).join('|')}`;
  }
});
...
const url = `https://maps.googleapis.com/maps/api/staticmap?size=800x600&maptype=roadmap&key=${import.meta.env.SECRET_GOOGLE_MAPS_API_KEY}&markers=${locationString}`;
```

The above code runs whenever an index page is generated from the content (so either locally on my dev machine or in GitHub Actions); it loops over the relevant posts, and if they have geo-info it adds it to the URL.

The Google Maps Static API is pretty smart about what it generates. For example, if I were to include a geo-location further towards the west of San Francisco, it automatically returns a map that also covers that area. I know, I know... it's nothing magic, but I still found it neat in an API that generates a static image.

[redirects]: /posts/astro-ssg-redirects
[repo]: https://github.com/puf/puf.io
[astro-github-actions]: https://github.com/withastro/action
[google-maps-static-api]: https://developers.google.com/maps/documentation/maps-static/start
[repo-index-page]: https://raw.githubusercontent.com/puf/puf.io/ca539b16edf7da1904de7b85dcc1d0b40029d02e/src/layouts/IndexPage.astro

### Storing the generated image as a static asset

Now that we know the URL that generates the map image, let's see how we actually call that URL, and what we do with the image it returns. Remember: to prevent for having to rerender this image for every visitor, we render the image only once each time the site is built, and then include the image as a static asset in the output [^3].

Here's the code to fetch the image from the URL we constructed above, and then store the binary data in both the `/public` and the `/dist` directories [^4]:
```javascript
...
const response = await fetch(url);
const blob = await response.blob();

const data = new Uint8Array(await blob.arrayBuffer());

const filename = `map-${type}-san-francisco.png`;

["dist", "public"].forEach(async (dir) => {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(process.cwd(), dir, filename), data);
});
```

With the map as a simple PNG image with the other static assets, I can include it in my HTML with a simple `img` tag [^5]:
```html
<div class="map">
  <img src={`/map-${type}-san-francisco.png`} />
</div>
```

The `{type}` in the above code can be `socials`, `books`, or `posts` (the three main sections of the site), although I've only tested it with `socials` so far [^6].

OK, with the map image generated, included in the published assets, and linked from the HTML, let's finish up by looking at the API key that I so sneakily hid from you so far. 🤫

## Protecting the Google Maps API key

Each call to the Google Maps API costs money, and while there's a pretty generous [free tier][maps-pricing], we still want to make sure only authorized calls can be made (and charged to my project). Authorization in Google Maps works with a combination of an [API key](api-key) and an optional [digital signature](signature).

In this project I only use the API key. I make sure that this is never leaked to anyone outside myself in two ways:

1. The API key (that authorizes the calls to the Maps API) is neither present in our site's source files (code or config), nor in the statically generated output.
2. We generate the map as a static image when the site is built, rather than generating it for every visitor. So the URL of the map in the HTML (as we saw above: `/map-socials-san-franisco.png`) does *not* include the API key in any way.

[api-key]: https://developers.google.com/maps/documentation/maps-static/get-api-key
[signature]: https://developers.google.com/maps/documentation/maps-static/digital-signature

### Making the API key available to local runs

But when the code that calls the Google Maps API runs, it of course needs the API key to actually succeed; so the (server-side) code we have above needs to know its value. To allow that, I put the API key in a [file named `.env`][astro-env-files] on my local system, that looks like this:
```
SECRET_GOOGLE_MAPS_API_KEY=AI...🤫...3Z8g
```

The values from a `.env` file are auto-included in your Astro code. 

The `SECRET_` prefix we used ensures that the value is only available to server-side code (`PUBLIC_` values are also present in client-side code).

I made sure this `.env` file is not committed to GitHub by putting it in my `.gitignore` file. So with that I can do a local dev run of the project.

### Making the API key available to GitHub Actions

Since the actual production build runs on GitHub Actions, we also need to make sure the `SECRET_GOOGLE_MAPS_API_KEY` is available there. I did this by [creating a repository secret](github-repo-secret) in the GitHub web UI with the same value I put in the `.env` file earlier:

![](https://i.imgur.com/UAjzdpC.png)

I then include this secret value in the [`astro.yaml`][astro-yaml] that drives my Astro build like this:
```yaml
...
jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    env:
      SECRET_GOOGLE_MAPS_API_KEY: ${{ secrets.SECRET_GOOGLE_MAPS_API_KEY }}
    ...
```

[maps-pricing]: https://mapsplatform.google.com/pricing/
[astro-env-files]: https://docs.astro.build/en/guides/environment-variables/
[github-repro-secret]: https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository
[astro-yaml]: https://github.com/puf/puf.io/blob/ca539b16edf7da1904de7b85dcc1d0b40029d02e/.github/workflows/astro.yml#L39-L40


Most of this was copy/paste from this blog post: [Astro with GitHub Secrets](https://kylehadland.com.au/blog/astro_github_secrets).

---

So there you have it: we added geo-location information in the frontmatter of each (relevant) Markdown file for our Astro SSG site, and then generate a PNG image with a static map for recent posts, that we included as a preloaded asset in the static content that we upload to GitHub Pages.

---


[^1]: At some point in the future I might also allow more complex geo-information rather than just a list of point. For example, the points below are part of a historic streetcar MUNI line, so plotting the actual route would make sense.
[^2]: I limit this to the first 9 posts, because otherwise I'd have to come up with a weird numbering scheme for the `ol` of my socials. But also: the map gets crowded enough already with just the first 9 posts.
[^3]: This is the step that I struggled most with. I took inspiration from the [astro-preload](https://github.com/LyonSyonII/astro-preload) package, but decided to implement my own (probably worse) variant of it. 
[^4]: As far as I understand `/public` is used during my local debug run, while `/dist` is used in the deployed build. I thought I'd only have to put the file in `/public`, but it seems that has already been copied over to `/dist` by the time my code runs. I guess that would also explain why `astro-preload` has a `astro:build:done` hook [here](https://github.com/LyonSyonII/astro-preload/blob/8f78474e0eefde10b7871a473ab5b028da01824a/index.ts).
[^5]: Instead of using a HTML `img` tag, I could've also used Astro's built-in `Image` component. I decided (without any specific reason) to pick the simpler option here.
[^6]: At some point I may want to generate separate maps for large geographic locations, like one for San Francisco and one for New York, hence the `san-francisco` in the filename. But I'm sort of pre-optimizing there for something I don't need yet, so... bad puf!