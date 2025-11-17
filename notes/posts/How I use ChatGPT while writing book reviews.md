---
title: "How I use ChatGPT when writing book reviews"
pubDate: "Jan 16, 2025"
alsoOn: [https://www.threads.net/@frankpuf/post/DE77rLDst0M, https://x.com/puf/status/1880318306785063243, https://bsky.app/profile/puf.io/post/3lfxfosgnfi2o, https://c.im/@puf/113845063411477833, https://www.linkedin.com/posts/puf_since-i-write-quite-some-book-reviews-now-activity-7286084160568406016-JmJs]
description: "When creating reviews of the books I read, I nowadays use ChatGPT for the common tasks of generating alt texts for the book cover images, generating a description for the book series, and generating a set of social posts from a review. I also ran an experiment to rewrite one of my reviews and explain its changes. To learn more on how I use ChatGPT for these actions, read the full post."
tags: [chatgpt, llm, ai]
---

For those of you who follow me (either through this site's [RSS feed](/feed.xml) or on socials), you probably know that I read a lot. In 2024 I read on average more than one book a week. And I posted reviews for many of those books on [puf.io/books](/books) and (in the second half of the year) on GoodReads and socials too.

Over that time I've "developed" a process to use AI/LLM as a tool to speed up my workflow. Specifically, I now regularly use ChatGPT (and occasionally Gemini) to:
* Generate alt texts for the book cover images
* Generate a description for the book series
* Generate a set of social posts from a review

And in one experiment, I used ChatGPT to:

* Rewrite a book review

More on each below...

### Generate alt texts for the book cover images

My book reviews typically start with an image of the book cover, and I want those images to have an alt-text for accessibility. 
I find that AI does a much better job than I do myself, as I tend to describe images with way too much knowledge about their context, while for the most equitable experience the alt-text should be a quite literal description. In other words, **an alt-text should describe what a viewer sees, not what they think**.

I learned an approach from [nohe]() when we wrote the blog post [Supercharge your apps with Firebase and the Gemini API](https://firebase.blog/posts/2024/02/supercharge-apps-firebase-gemini/) for Firebase, and is based on the [W3C tips for image alt texts](https://www.w3.org/WAI/tutorials/images/tips/). The prompt I use is:

> This GPT generates alt text for images to make web content accessible, with guidance to focus on clarity and relevance. The GPT considers each image's role and function in the context of a web page—imagining a scenario where it's describing the page aloud over the phone to help someone understand it. For functional images that provide information, serve as buttons, or links, the GPT creates concise alt text to describe the visual elements accurately and clearly. For images deemed decorative, with no information value and no interactive role, the GPT may treat them as decorative and skip alt text generation. The descriptions aim to be straightforward, informative, and visually descriptive while avoiding unnecessary detail.

I created a [custom GPT](https://openai.com/index/introducing-gpts/) with this prompt, so my workflow is that I copy/paste the book cover image into ChatGPT, hit enter, and then copy/paste the output back into my markdown.

The second use-case for me is to generate introductory content...

### Generate a description for the book series

Many of the books I read are part of a larger series, and especially on social media I find it useful to give a description of the series before talking about the specific book.

While it's fun to think of the series in a first and second review, by the third book or so I find myself asking ChatGPT to give me a two sentence summary of the book series. I then either copy/paste what it gives me and edit it into my own voice, or I start typing my own description and then borrow (i.e. copy/paste) bits from what ChatGPT generated.

This is the part task that feels most like I'm posting AI-generated content, which I'm somewhat torn about - so I'd love to hear your thoughts through the links at the top of this article.
  
### Generate a set of social posts from a review

Once my book review is complete and posted on [puf.io/books](/books), I also post part of it on GoodReads, and then create threaded posts for it on the various social networks (Bluesky, Mastodon, Threads, Twitter/X, and ocassionaly LinkedIn nowadays).

Over time I found that I usually have 2 or 3 posts in such a social thread:

1. Introduction to the book series (if this is a book in the series) or the writer
2. Talk about this specific book and what happens (without too many spoilers)
3. My mini-review, rating, and a link to my site

Since the format is so predictable I recently asked ChatGPT to generate it for me with this prompt:

> Condense this book review into 3 tweets: first one to talk about the writer and their books, second one to talk about this specific book, and third one to give my view on the book (and link to a site).\
> \
> \<my book review>

The output looked good enough as a starting point, which I then further refined (and edited back into my own voice) in the tool I use for social posts.

---

#### When the LLM generates, I still make final selection and edits

In most of the above cases, I use the LLM as a tool to generate early or intermediate content. As in: I take what the AI generates as input and transform it to fit with my needs. Sometimes I copy only snippets from the LLM into my own sentences, at other times I copy/paste what the AI generated and then edit that into what I want.

Recently though I did an experiment, where I asked ChatGPT to be the final arbiter of my prose.

### Rewrite a book review

When I was done with a full book review recently, I wondered how I could improve it. So I asked ChatGPT with this prompt:

> Any rewrites you'd propose to my book review below? Explain any change.

It came back with a list of eight recommendations in the following format:

> 1. Opening Sentence Adjustment:\
> Original: "Starting off the new year with a good book that deservedly gets top rating from me."\
> Revised: "Starting off the new year with a great read that earns a top rating from me."\
> Why: "Great read" is more concise and natural. "Earns" feels a bit stronger and smoother than "deservedly gets."
>
> 2. Tightening Phrasing:\
> Original: "...explores the history and evolution of humankind in a pretty unique way."\
>Revised: "...explores the history and evolution of humankind in a uniquely engaging way."\
> Why: "Pretty unique" can feel less polished. "Uniquely engaging" adds a more vivid description.
> ...

I thought most of these led to a more common style, so used many of them in [my posted review](/books/nexus---yuval-noah-harari/). Later I realized though that **the result of the revisions felt a lot less like "me"**, so I probably won't be using an LLM for this purpose going forward. It was interesting though, so I might still ask it for its feedback to see if I want to refine my own writing style.

---

These some of the way I've been using ChatGPT (and other LLMs) while writing book reviews that I post here. Do you also use AI to help you with your writing? What are you thoughts? Any common patterns that you want to share? Reach out through the links at the top of this post!