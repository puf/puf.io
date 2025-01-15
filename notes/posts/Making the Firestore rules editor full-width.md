---
title: "Making the Firestore rules editor full width"
pubDate: "Jan 15, 2025"
alsoOn: [https://bsky.app/profile/puf.io/post/3lfsly6mo5f23, https://www.linkedin.com/feed/update/urn:li:activity:7285391858715762688/, https://c.im/@puf/113834246866835726, https://www.threads.net/@frankpuf/post/DE3A3MZu6Z5, https://x.com/puf/status/1879626093214220557]
---

The Firestore console artificially constrains the maximum width of its rules editor. This means that on my 27" 4K external monitor, I end up with this [^1]:

![screenshot of fullscreen clamped editor](https://i.imgur.com/gneHQ6v.png)

All that blank space just make me cringe, since the code now requires horizontal scrolling. I have no idea why such max-width restrictions are added to websites [^2], but today I decided to remove this specific limit for me. If you want to remove it for yourself too, follow the steps I took below.

---

I use [Tampermonkey][tampermonkey], which is a Chrome extension that allows you to run custom client-side scripts (known as [userscripts][userscript]) for specific sites. I mostly use userscripts that others have created, but for I created my own for this Firestore rules editor use-case.

Here's the userscript in its entirety:

```javascript
// ==UserScript==
// @name         Remove Firestore rules editor max-width constraint
// @match        https://console.firebase.google.com/u/0/project/*/firestore/databases/*/rules
// @grant        GM.addStyle
// ==/UserScript==

GM.addStyle(`
.c5e-nav-expanded mat-single-grid, .c5e-nav-expanded [mat-single-grid]
  {max-width:none!important}
.c5e-nav-expanded mat-single-grid [mat-cell="16"]:not(td), .c5e-nav-expanded 
  [mat-single-grid] [mat-cell="16"]:not(td){max-width:none!important}
`)
```

The main parts in here are:

* The `@match` clause determines what web pages this script applies to [^3], and we specify the URL of the Firestore rules editor. The first `*` wildcard in this URL is for the project ID, and the second `*` is for the database ID.
* The `@grant` clause says that this script needs `GM.addStyle`, which is the Greasemonkey [^4] command to add custom styling to the page.
* The two (long) CSS selectors match the elements that we need to modify. I found these selectors by inspecting the HTML elements (cmd-shift-C on mac) in Chrome Developer Tools and finding the outermost ones that set a `max-width`).
  1. ![](https://i.imgur.com/RnOvOEJ.png)
  2. Note how this `fire-rules-card` element 👆 still spans the full available width.
  3. But then this `mat-single-grid` element 👇 has a much smaller width, being clipped.
  4. ![](https://i.imgur.com/exzKYdI.png)\
     *Oops, the wrong element is highlighted here.*
  5. This `mat-single-grid` element is narrower because it has a `max-width` set in its CSS.\
  ![](https://i.imgur.com/kXDd4xs.png)
  6. I copied the selector by right-clicking on the properties and <kbd>Copy selector</kbd> and pasted it into my userscript.
  7. I repeated steps 3-6 for one more element under `mat-single-grid` that also set the `max-width`.
* For each of these elements in my userscript I set `max-width: none!important` to clear the `max-width` value that the site's own CSS set.

After saving this userscript to Tampermonkey and reloading the Firebase console, my Firestore rules editor now looks like this:

![screenshot](https://i.imgur.com/PXinlEW.png)

OK, the window is indeed still much bigger than needed. But now I can use my own preferred window layout management technique rather than having the Firestore rules editor dictate its own.

Love it? Hate it? Sound of with the social links at the top of this page!


[tampermonkey]: https://www.tampermonkey.net/
[greasemonkey]: https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/
[userscript]: https://en.wikipedia.org/wiki/Userscript


---

[^1]: In case you're curious: these are the rules for a Firebase project where I test a lot of Stack Overflow questions. The (numeric) collection IDs correspond to the Stack Overflow question ID. So for example, that first rule was what I wrote when answering [this question](https://stackoverflow.com/q/79124540).
[^2]: Just kidding: I actually *do* know the reason many sites do this, I just think it does more harm than good.
[^3]: Keep in mind: the script runs in your local browser, so it has access to a lot of information. While my code just adds some CSS styling, there are many more malicious use-cases possible.
[^4]: [Greasemonkey][greasemonkey] is the original userscript manager, but it's only available for Firefox. Tampermonkey runs (amongst others) on Chrome and supports the same userscript format.