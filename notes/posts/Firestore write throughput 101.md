---
title: Firestore write throughput 101
pubDate: July 4, 2025
alsoOn: 
 - https://x.com/puf/status/1941568685711221043
 - https://bsky.app/profile/puf.io/post/3ltafyvtrik2s
 - https://c.im/@puf@c.im/114802100493760445
 - https://www.threads.com/@frankpuf/post/DLvJHn1MT1P
 - https://www.linkedin.com/posts/puf_somebody-is-having-write-scalability-activity-7347334527201026048--BJs?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAA6E1MBzbF9oPv2cJb9vbv4cyPR-rhR1Zs
---

A user on /r/Firebase asked for help with their [games' write throughput on Firestore](https://www.reddit.com/r/Firebase/comments/1lrjqab/struggling_with_scaling/), and I ended up writing a long list of things they might not know/realize.

I'm replicating it here - where I'm more likely to update it.

* **Firestore is a distributed database where writes are immediately consistent** - so when one reader sees a recent write, all readers see that write.
* Immediate consistency means that all storage nodes need to coordinate with each other before they commit, which takes time (even in Google's fiber-connected data centers, the speed of light is hard to ignore).
* Firestore automatically scales on both reads and writes, but **on writes Firestore is susceptible** to so-called hotspots (see more on these below).
* The alternative would have been to use eventual consistency for the writes. That would have led to higher write throughput, but would have required the clients to deal with potentially inconsistently synchronized data.
* Both immediate consistency and eventual consistency are valid models for different scenarios.

* **Hotspots happen when many writes end up updating data that is stored close to each other** on the disks.
* **An index is just data stored on disk** (you can usually think of it as a file if that helps, just keep in mind that it's actually a tree structure across many files).
* Writing a document also updates all indexes that the document is in, so all collection and collection group indexes for which the document contains (contained) any fields.
* When a hotspot occurs, it's usually in an index on a field where the values in that index across all indexed documents are semi-sequential.
* **To help you diagnose hotspots, use the [key visualizer](https://cloud.google.com/firestore/native/docs/key-visualizer)**. Definitely check the page on common patterns in [document keys](https://cloud.google.com/firestore/native/docs/keyvis-patterns) and [index keys](https://cloud.google.com/firestore/native/docs/keyvis-patterns-index).
* My rules of thumb for reading the output of this tool:
  * If it looks like random noise, you're doing it right.
  * If it looks like abstract art, you're doing it wrong.\
    So look for things like bright vertical lines or repetitive gradients that show up in regular intervals.
* **To prevent hotspots, ensure that your writes are spread out evenly** across the available namespace.

* The most common source of hotspots I've seen are:
  * custom document IDs that are not sufficiently random (e.g. anything starting with a timestamp)
  * an index with values that are not sufficiently random (e.g. on a timestamp)
* Pay extra attention to **collection group indexes**, as the documents from all collections in that group write to the same index. So if you have a collection group index on a timestamp field, it's likely to be one of your first hotspots.

Some great additional articles in the Firestore documentation to read if you really want to learn more:

* [Understand reads and writes at scale](https://firebase.google.com/docs/firestore/understand-reads-writes-scale)
* [Understand real-time queries at scale](https://firebase.google.com/docs/firestore/real-time_queries_at_scale)

There's much more to say about Firestore of course, so I expect I'll do more of these  "facts about <topic>" lists.
