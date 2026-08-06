---
title: "Book covers as a source of happiness"
pubDate: Aug 6, 2026
alsoOn:
  - https://www.threads.com/@frankpuf/
  - https://c.im/@puf/
  - https://bsky.app/profile/puf.io/
  - https://x.com/puf/
tags: [e-ink, reading, picpak, kindle]
aliases: []
---

For most of my life I've been a reader. As a child, I would go to the library at least once a week, often twice, and each time I would go home with the maximum number of books I was allowed to check out.

It all started with physical books of course, of the dead tree type, but that changed when we moved continents. We couldn't reasonably bring all the books we owned with us, so we had to get rid of many hundreds of them. This was before Little Libraries were a thing, and I hated having to get rid of so many of the beloved books.

## Discovering e-readers

For a few years I read (many fewer) books electronically on cramped, small LCD devices. Luckily, I then discovered e-ink - a passive, low-power display technology, perfect for electronic books. I got my first e-reader in 2009: a [Sony Reader PRS-505](https://en.wikipedia.org/wiki/Sony_Reader#PRS-505).

![sony](https://i.imgur.com/0hS4VjZ.png)

When I switched to using a Kindle in 2011, you had two options for what the device would display when not in use: you could get your Kindle with a discount and it'd show ads, or pay more and it'd show a random stock illustration.

![Kindle ad](https://i.imgur.com/0UC7p5g.png)
*👆 This is an example of an ad I saw, I didn't actually buy this specific book. 😅*\
*👇 A stock illustration from someone else's Kindle, as I never paid for the ad free version at that time.*
![stock illustration](https://i.imgur.com/FgfhS9E.jpeg)

I never really minded the ads. Though many of them were for romance novels, I also got some interesting reads from them. But then in 2021 Amazon updated the Kindle firmware to allow the non-ad versions to show the cover of the book that you're reading. It was my favorite tech thing of that entire year!

![book cover in 2021](https://i.imgur.com/LptAdGA.png)

It turns out seeing the book cover, on my nightstand or elsewhere, was a small happy moment for me; one that I'd missed since switching to Kindle e-readers.

---

## Tracking my reading

I am still an avid reader. In recent years I read on average just over one book per week. And while I very much enjoy the reading experience, I have a lousy memory. Most of the time I'd be hard-pressed to tell you the three most recent books I finished, even when I likely very much enjoyed them.

This is one of the reasons I track my reading meticulously on [Goodreads](https://www.goodreads.com/frankvanpuffelen) and on https://puf.io/books. One thing I love on Goodreads is seeing a tableau of books I recently read.

![recent read covers](https://i.imgur.com/LTvd15V.png)
*👆 The covers of the 20 most recent books I finished before publishing this post*

Being a reader of e-books, this is the closest I will ever get to having a shelf of books that I have read. Seeing it makes me happy.

---

## E-ink devices

Over the years, I've also become lightly obsessed with e-ink screens. I order more devices with e-ink screens than I actually need, and then end up trying to find a use for them.

![pic of eink devices](https://i.imgur.com/SrHC34R.png)
*I have multiple of most of these and e-recycled many more*

Recently I got some Picpak devices, which are cute, small, color e-ink devices. The screens can show only black, white, red and yellow. So while they are promoting them to show photos, you'll see that the photo selection on their boxes is... optimized for the display: none of these pictures show blue or green.

![pic of Picpak boxes](https://i.imgur.com/VoVNwL9.png)

That makes sense, and I even got some pretty good photos on it myself. But it takes more effort than I'd like: selecting photos with necessary color palette (so without much blue/green), cropping them to fit the 4x3 aspect ratio of the devices, uploading them through the (finicky) Picpak app. It all works and the result is great, but I wasn't sure how often I'd be doing this.

Then somebody posted what they had done with their Picpak devices to [r/eink](https://www.reddit.com/r/eink/comments/1ux4c0p/comment/p0mep3z/) and I immediately knew that I wanted that too:

![Three Picpak e-ink screens showing a weather monitor, a spotify playlist, and a statistics dashboard](https://i.imgur.com/AAqFdbW.png)
*Look at the vibrant, solid yellow and red on these screens.*

I set up one of my Picpaks to display today's weather, through the [Tesserae](https://tesserae.ink) companion server for driving e-ink screens.

![picpak on fridge door](https://i.imgur.com/qFbeUt0.png)

Then I started playing with what else Tesserae could do, and had it send one of my favorite recent book covers to another Picpak.

![The Martian Chronicles on LCD monitor and on Picpak](https://i.imgur.com/u4YR1TS.png)
*The gorgeous book cover for The Martian Chronicles on a monitor and an e-ink device*

And suddenly I knew what I wanted: to have a Picpak show the cover of a book I am currently reading or have recently read, and then show different ones during the day.

---

## Automatically showing a recent book cover

So I built, or rather I had Claude Code build, a solution that updates my red Picpak at fixed times to show a book cover. Claude wakes up at those times, determines what book cover to show from my Goodreads RSS feeds, resizes the image, and pushes it to Tesserae to show on the Picpak. The Picpak device wakes up once an hour and grabs the current cover image from Tesserae.

![](https://i.imgur.com/iiSqqtO.png)

As you might expect from something vibe coded like this, it's overly complicated, even after three iterations of telling it what to fix and clean up. But... it works. 

I now see a different cover image at various times of the day, which automatically updates with my Goodreads status.

![](https://i.imgur.com/XmLwzad.png)
![](https://i.imgur.com/dZg31Dh.png)
![](https://i.imgur.com/Fx3Y4kg.png)

As you can see above, the images aren't always great, and the Picpak screens are rather dark and muted. But even then, every time I glance at this little screen, I am reminded of a current or recent book, and that brings a smile to my face.

---

For those who are really curious, e-ink screens are notoriously slow to update and color e-ink screens are by far the worst of that. There is lots of room for improvement and recently there have been some promising breakthroughs, but... here's the update cycle for my Picpak.

<video width="200" height="356" controls>
  <source src="https://i.imgur.com/NvOV7Kf.mp4" type="video/mp4">
  ![](https://i.imgur.com/omsrKQ3.gif)
</video>

That's 20+ seconds for one full refresh. 🤯 

Luckily, normally this just happens automatically once per hour, and I'm not waiting for it. It's just a happy moment when my eye glances by the little screen and I see yet another book I recently read.