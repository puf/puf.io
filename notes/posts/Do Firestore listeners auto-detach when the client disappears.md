---
title: "Do you need to unregister Firestore listeners when a web page is closed?"
pubDate: "December 12, 2024"
alsoOn: [https://bsky.app/profile/puf.bsky.social/post/3ld4yc3wv3n2a, https://x.com/puf/status/1867287624878068063, https://stackoverflow.com/q/79263392, https://www.threads.net/@frankpuf/post/DDfV-a7M8Ve, https://c.im/@puf/113641458278712428]
description: "TL;DR: when you close a browser tab that has active listeners on Firestore, the Firestore server will automatically stop listening for updates for those listeners too (after a delay). So you don't need to try and handle such unexpected disconnects yourself with (for example) a beforeunload handler.Read the full article for a longer explanation and how this was verified."
---

Somebody posted a question on Stack Overflow this week where they were [trying to unregister their Firestore listeners](https://stackoverflow.com/q/79263392) in the browser's `beforeunload` event. I explained why this won't work, but it's essentially this from the [MDN docs on the `beforeunload` event](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event)

> The beforeunload event is not reliably fired, especially on mobile platforms.
 
Essentially: you can't reliably make network calls in this situation anymore. Before digging into the question of whether you even need to unregister your Firestore listeners, let's talk about the ways that a client (the web page in this case) can disconnect from a server (Firestore in this case).

---

#### Clean disconnects and dirty disconnects

What the developer was trying to do was what I know as a **clean disconnect**, where the application initiates the disconnect and has time to inform the server that it will disappear. In Firestore apps that'd indeed be a perfect moment to unregister any active listeners.

But... we all know that the internet is a place fraught with peril. Apps crash, processes get killed, tunnels suddenly appear, and mobile networks randomly drop. Realistically, you can't rely on every disconnect being clean: **a significant portion of the disconnects will not be clean** or what I know as a **dirty disconnect**. 

In the case of a dirty disconnect, the server typically only notices that the client is gone because they stop receiving keep-alive/heartbeat messages from that client, or because they stop responding to messages the server sends.

In fact, the internet was built on the premise of having unreliable connections. That's why sockets time out when there has been no communication on them for a while, rather than expecting the client to always tell them "well, I'm gonna hang up now - ttfn" before they disconnect. 

And most (especially mature) services on the internet also handle such dirty disconnects. Including Firestore's servers that handle realtime listeners for its clients.

---

#### What happens when a web page that has an active listener on Firestore gets closed?

I ran a small experiment with Firestore where I created two small web pages (in StackBlitz):

1. A page that add a new document to a collection once per minute ([link](https://stackblitz.com/edit/firestore-v9-writer)).
      ```dart
      const writeDocAndWait = async () => {
        const now = Date.now();
        const ref = await addDoc(collection(db, "79263392"), {
          timestamp: now
        });
        console.log(`Doc written: ${ref.id}: timestamp: ${now}`);
        setTimeout(writeDocAndWait, 60*1000);
      }

      writeDocAndWait();
      ```
2. A page that listens for the newest document in that collection ([link](https://stackblitz.com/edit/firestore-v9-listener)).
      ```dart
      let qry = query(
        collection(db, "79263392"), 
        orderBy("timestamp", "desc"), 
        limit(1)
      );

      onSnapshot(qry, (snapshot) => {
        if (snapshot.empty) {
          console.log(`No results`)
        }
        else {
          console.log(`timestamp: ${snapshot.docs[0].data());
        }
      })      
      ```

I opened one instance of the writer page, so that a new document would be created in the test collection every minute. I kept this page/tab open for the duration of the experiment.

I then opened one instance of the listener page, waited a few minutes, opened two more instances of the listener page, waited another few minutes and opened another two instances (for a total of 5). After a short while, I then closed the listeners, from 5 to 3, then from 3 to 1, and finally I closed the final listener.

*Note: I had no other reading processes of this data open. Specifically, I made sure to not have the Firestore console open on a panel that shows the data, as those reads would also be counted.*

This is what the Firestore usage console showed at the end of this experiment:

![](https://i.imgur.com/EFG4rmV.png)

These charts cover a time period of 60 minutes (one of the settings in the Firestore usage console). The top chart shows the number of document reads and writes that Firebase recorded in a minute. The bottom chart shows the number of listeners and connections in each minute. Since I had exactly one listener per connection, the lines overlap here.

*Note: Firestore does *not* charge you for active connections, so the second chart is not related to any cost.  It does charge for document reads and document writes though, so the top chart represents chargeable operations.*

I've annotated the 3 phases in the charts:

1. **Building out the repro**\
As I was still setting up the experiment, there are some spurious reads here.\
You can see that the orange line (and the total number of writes) shows a pretty consistent 1 write per minute for the entire hour. Any variance here is likely just some jitter in my client-side timer logic.
2. **Building up the number of listener pages**\
In the second phase, I started with 1 listener page, then went to 3 listener pages, and finally to 5 listener pages. Each time you can see the number of document reads go up as well.\
There is some jitter here too, but the average is pretty well aligned with the number of listeners in the top chart.
3. **Turning down the listeners**\
In the third phase I first closed 4 listener pages in steps, leaving 1 open, and waited a few minutes. Then finally I closed that final page/tab too. The number of reads went down too as you can see.\
*There was a delay between closing the tab/page and the drop of the reads per minute*. It wasn't long, maybe a minute, so that's how long it took the server to notice that the listener was gone.

You can see that at the end of the bottom chart, the number of active listeners is back at 0 and in the top chart the number of reads per minute is also back to 0 - while the one writer we kept open keeps creating one new document every minute.

---

So to answer the initial question: Do you need to unregister Firestore listeners when you close the web page? No, that is not needed.

The Firestore server automatically detects (with a short delay) that a client has disappeared and will stop monitoring for changes for that client. So while it's a *good practice* to unregister your Firestore listeners when there's a *clean disconnect* (like when the user clicks a button to sign out of your app), **there is no need to go out of your way to unregister listeners when there's a dirty disconnect**.

---

If you like reading about Firestore, here are some other articles on this site:

* [How to enable Firestore caching on web](/posts/enable-firestore-caching-on-web)
* [Counting document reads per user in Firestore](/posts/counting-document-reads-in-firestore)
* [Waiting for Firestore to create a document](/posts/waiting-for-firestore-to-create-a-document)
* [How to perform geoqueries on Firestore (somewhat) efficiently](/posts/how-to-perform-geoqueries-on-firestore-somewhat-efficiently)
