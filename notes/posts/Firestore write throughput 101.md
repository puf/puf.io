---
title: Firestore write throughput 101
pubDate: July 4, 2025
alsoOn: [https://x.com/puf/, https://www.threads.net/@frankpuf/, https://bsky.app/profile/puf.io, https://c.im/@puf]
---

A user on /r/Firebase asked for help with their [games' write throughput on Firestore](https://www.reddit.com/r/Firebase/comments/1lrjqab/struggling_with_scaling/), and I ended up writing a long list of things they might not know/realize.

Since I like to own my content these days, I'm replicating it here - where I'm more likely to update it.

* **Firestore is a distributed database where writes are immediately consistent** - so when one reader sees a recent write, all readers see that write.
* Immediate consistency means that all storage nodes need to coordinate with each other before they commit, which takes time (even in Google's fiber-connected data centers, the speed of light is hard to ignore).
* Firestore automatically scales on both reads and writes, but **on writes Firestore is susceptible** to so-called hotspots (see more on these below).
* The alternative would have been to use eventual consistency for the writes. That would have lead to higher write throughput, but would have required the clients to deal with potentially inconsistently synchronized data.
* Both immediate consistency and eventual consistency are valid models for different scenarios.

* **Hotspots happen when many writes end up updating data that is stored close to each other** on the disks.
* **An index just data stored on disk** (you can usually think of it was a file if that helps, just keep in mind that it's actually a tree structure across many files).
* Writing a document also updates all indexes that the document is in, so all collection and collection group indexes for which the document contains (contained) any fields.
* When a hotspot occurs, it's usually in an index on a field where the values in that index across all indexed documents are (somewhat/semi) sequential.
* **To help you diagnose hotspots, use the [key visualizer](https://cloud.google.com/firestore/native/docs/key-visualizer)**. Definitely check the page on common patterns in [document keys](https://cloud.google.com/firestore/native/docs/keyvis-patterns) and [index keys](https://cloud.google.com/firestore/native/docs/keyvis-patterns-index).
* My rules of thumb for reading the output of this tool:
  * If it looks like random noise, you're doing it right.
  * If it looks like abstract art, you're doing it wrong.
* **To prevent hotspots, ensure that your writes out are spread evenly** across the available namespace.

* The most common source of hotspots I've seen are:
  * custom document IDs that are not sufficiently random (e.g. anything starting with a timestamp)
  * an index with values that are not sufficiently random (e.g. on a timestamp)
* Pay extra attention to **collection group indexes**, as the documents from all collections in that group write to the same index. So if you have a collection group index on a timestamp field, it's likely to be one of your first hotspots.