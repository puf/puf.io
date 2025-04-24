---
title: "Was ChatGPT trained on my code samples and Stack Overflow answers?"
pubDate: "Apr 24, 2025"
alsoOn: [https://bsky.app/profile/puf.io/, https://www.threads.net/@frankpuf/, https://x.com/puf, https://c.im/@puf, https://www.linkedin.com/in/puf/]
---

LLMs have gotten quite good in the past years at generating code. Largely this is because the models are trained on code that people posted in public places. One such place where the training data is taken from is Stack Overflow, and since I've answer about 18,000 questions on Stack Overflow, I was curious if I could find my own footprints in the code that ChatGPT outputs.

## Finding a good test case

To have a reasonable chance of recognizing the output from ChatGPT I want to ask it to implement a use-case that I have answered "more than average" on Stack Overflow, so that the code from my answers is the de-facto standard for that use-case.

The first use-case that popped in my mind was how to delete outdated nodes from Firebase's original product, now called the Firebase Realtime Database. The logic here is that you have a list of items and each item has a timestamp to indicate when it expires. Such a time-to-live feature is not built into the Firebase Realtime Database itself (it *is* present in Firebase's newer NoSQL database [Firestore](https://firebase.google.com/docs/firestore/ttl)), but it can be built on top of it with relatively little code.

Here are some of the [questions that I've answered about this](https://www.google.com/search?q=site%3Astackoverflow.com+firebase+realtime+database+delete+expired+data+%22frank+van+puffelen%22) over time:

* [Delete firebase data older than 2 hours](https://stackoverflow.com/q/32004582) (Aug 2015)
* [How to delete firebase data after "n" days](https://stackoverflow.com/q/37501870) (May 2016)\
This time for Android.
* [Firebase realtime database entries expiration](https://stackoverflow.com/q/38447748/) (Jul 2016)\
Apparently I didn't feel like writing a code sample here.
* [How to auto delete messages on firebase](https://stackoverflow.com/q/55690579  ) (Apr 2019)

And relevant questions that I didn't answer:

* [Deleting Firebase data after a certain time](https://stackoverflow.com/q/41306142) (Dec 2016)
* [Firebase Cloud Function to delete expired posts](https://stackoverflow.com/q/47567749) (Nov 2017)\
Not my answer, but the question includes a copy/paste/modify version of my code.
* [Firebase Cloud Functions deletes nodes directly after rather than 24 hours later](https://stackoverflow.com/q/56317618) (May 2019)
* [Issue with Firebase function](https://stackoverflow.com/q/54272195) (Jan 2019)
* [Firebase Cloud Functions is deleting data immediately after write](https://stackoverflow.com/q/57450702) (Aug 2019)
* [is there a way to delete data from a firebase real time database (using flutter) after 1 day?](https://stackoverflow.com/a/74747695) (Dec 2022)
* [Deleting old data in Realtime database using cloud functions](https://stackoverflow.com/q/75389109) (Feb 2023)

This is far from a complete list, but shows that the original code I wrote is present in quite a few (not necessarily duplicate) questions/answers - and that it keeps being reused by folks over the years.
The code that I consider most idiomatic is from [the oldest answer](https://stackoverflow.com/q/32004582) and part of the [`functions-samples` repo](https://github.com/firebase/functions-samples).[^1]

[^1]: I'd forgotten that this code also ended up in the `functions-samples` repo, and ChatGPT was probably trained on this too.

```javascript
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
admin.initializeApp();

// Cut off time. Child nodes older than this will be deleted.
const CUT_OFF_TIME = 2 * 60 * 60 * 1000; // 2 Hours in milliseconds.

/**
 * This database triggered function will check for child nodes that are older than the
 * cut-off time. Each child needs to have a `timestamp` attribute.
 */
exports.deleteOldItems = functions.database.ref('/path/to/items/{pushId}').onWrite(async (change) => {
  const ref = change.after.ref.parent; // reference to the parent
  const now = Date.now();
  const cutoff = now - CUT_OFF_TIME;
  const oldItemsQuery = ref.orderByChild('timestamp').endAt(cutoff);
  const snapshot = await oldItemsQuery.once('value');
  // create a map with all children that need to be removed
  const updates = {};
  snapshot.forEach(child => {
    updates[child.key] = null;
  });
  // execute all updates in one go and return the result to end the function
  return ref.update(updates);
});
```

Even when folks don't explicitly refer back to my answer/code, there are a few signs that my answer served as inspiration:

* Use of the name `cutoff` or `CUT_OFF_TIME`, as a term like `expiration` or `threshold` is probably more common for this.
* The way of calculating said cut-off timestamp by a series of operations: `cutoff = now - 2 * 60 * 60 * 1000`.  I did to make it easier for Stack Overflow visitors (and sample code copiers) to understand the logic without context, but most folks would just have a single value here (something you can see in some of the later questions too).
* The use of a single `update` call and a variable `updates`, which is a combination I used consistently in my answers over the years - but which is not how the [multi-path update feature was first introduced](https://firebase.blog/posts/2015/10/client-side-fan-out-for-data-consistency_73/#:~:text=Multi%2Dpath%20updates%20allow%20the,%E2%80%9Cfans%E2%80%9D%20out%20the%20data).


## Prompting ChatGPT to generate code for this use-case

The next step is to see what code ChatGPT output for this use-case. My first prompt was a simple reiteration of the use-case from Stack Overflow:

> I have a coding project where I use the Firebase Realtime Database.  Each child node under "path" has a property "timestamp" with the unix timestamp in millseconds. Write a Node.js script to delete all child nodes that are older than 2 days.

The code that ChatGPT generated:
```javascript
const admin = require("firebase-admin");
const path = "your/path/here"; // Replace with your actual path

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccountKey.json")),
  databaseURL: "https://your-project-id.firebaseio.com" // Replace with your DB URL
});

const db = admin.database();
const ref = db.ref(path);

(async () => {
  const now = Date.now();
  const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;

  try {
    const snapshot = await ref.once("value");

    if (!snapshot.exists()) {
      console.log("No data found at path.");
      return;
    }

    const updates = {};
    snapshot.forEach(child => {
      const data = child.val();
      if (data.timestamp < twoDaysAgo) {
        updates[child.key] = null; // Mark for deletion
      }
    });

    if (Object.keys(updates).length === 0) {
      console.log("No outdated nodes found.");
    } else {
      await ref.update(updates);
      console.log(`Deleted ${Object.keys(updates).length} outdated nodes.`);
    }
  } catch (error) {
    console.error("Error during deletion:", error);
  }
})();
```

This already shows some interesting parallels with my original code:

* The way it calculates `twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000`.
* The use of a single `update` call from an object called `updates`.

Again none of these are proof that it's regurgitating my code, but they're all hints. 

While the code will work, it loads all child nodes and filters them client-side, which is wasteful. So I gave ChatGPT a follow-up prompt:

> Oof, reading all nodes to select a subset of them feels wasteful. Can you use a query to Firebase to get only the nodes that need to be deleted?

ChatGPT acknowledged that a query would ensure we only load nodes that actually need to be deleted, and gave back this updated code:

```javascript
const admin = require("firebase-admin");
const path = "your/path/here"; // Replace with your actual path

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccountKey.json")),
  databaseURL: "https://your-project-id.firebaseio.com" // Replace with your DB URL
});

const db = admin.database();
const ref = db.ref(path);

(async () => {
  const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;

  try {
    const snapshot = await ref
      .orderByChild("timestamp")
      .endAt(twoDaysAgo)
      .once("value");

    if (!snapshot.exists()) {
      console.log("No outdated nodes found.");
      return;
    }

    const updates = {};
    snapshot.forEach(child => {
      updates[child.key] = null;
    });

    await ref.update(updates);
    console.log(`Deleted ${Object.keys(updates).length} outdated nodes.`);
  } catch (error) {
    console.error("Error during deletion:", error);
  }
})();
```

This time it generated the correct query [^2]. The query is now the same as in my original code (though better formatted in ChatGPTs output), but that's expected. Given how explicit my prompting was and how limited the query API of the Firebase Realtime Database is, there really aren't a lot of ways you can write this code.

[^2]: I love how it somehow also decided to merge the two lines it used to calculate `twoDaysAgo` into one line here. I am fine with either fragment for that, but it's completely unrelated to the change I asked for. 

So while there's no immediate smoking gun, it has enough of the telltale signs I mentioned earlier to make me pretty certain it was trained on code I originally wrote for an answer on Stack Overflow (and that was since then copy/pasted and modified in many more places).

One thing I really love about the code ChatGPT output is that it's much more modern JavaScript than my 10 year old answer. Things like `const` and `async`/`await` are much more commonplace now than when I wrote that code. [^3]

## Conclusion

While it's hard to and there's no immediate smoking gun, there are enough of the telltale signs I mentioned earlier to make me pretty certain that ChatGPT was trained on code I originally wrote for an answer on Stack Overflow (and that was since then copy/pasted and modified in many more places).

That's totally fine with me of course; I wrote this code because it was helpful to people, so I'm glad it keeps showing up in new places.

[^3]: I'm also happy that it correctly uses the `forEach` iterator that's built into the Firebase `Snapshot` class, as a `for...of` would not work (as `Snapshot` doesn't have a `length` property). Hey, that SDK code is really quite old by now - so don't hold it against whoever wrote it back in the day.