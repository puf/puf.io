---
title: Waiting for Firestore to create a document
pubDate: August 3, 2024
alsoOn: [https://stackoverflow.com/q/78827417, https://x.com/puf/status/1819738765465887002, https://www.threads.net/@frankpuf/post/C-NfevfpZPG, https://c.im/@puf/112898534531034359]
---

I recently saw this in a (Flutter) code-base:
```dart
final cred = await FirebaseAuth.instance.signInAnonymously();
final user = cred.user!;
Future.delayed(const Duration(seconds: 15);
final doc = await FirebaseFirestore.instance.doc(user.uid).getDoc();
```

I asked the engineer why there was a 15 second delay hard-coded in there, and it turns out there is a backend process (a Cloud Function in this case) that creates a document with (default) settings for the user, and they didn't know how long that takes.

This sort of code leads to all kinds of problems. The 15 seconds is a pretty safe upper limit, but typically document creation will take a lot less time - and you'll be waiting needlessly for the rest of the 15 seconds. And in the one case in a million where it takes more than 15 seconds to create the document, you're gonna have a hard time debugging it.

By using [Firestore's built-in realtime listeners](https://firebase.google.com/docs/firestore/query-data/listen) is actually quite easy to wait for the document to be created, but no longer...

The simplest way to see this is to actually use a listener, which (based on the documentation linked above) works like this:

```dart
final uid = FirebaseAuth.instance.currentUser!.uid;
final ref = FirebaseFirestore.instance.doc('users/${uid}')
ref.snapshots().listen((snapshot) {
  if (snapshot.exists) {
    debugPrint(snapshot.data());
  }
});
```

With this you'll see debug output right when the document is created. Firestore *actively* listens for the update on the database server, and gets notified (server-to-client) right away when that happens.

If you want to use this in your UI, you can hook it up in a `StreamBuilder` like this:

```dart
StreamBuilder<DocumentSnapshot>(
  stream: ref.snapshots(),
  builder: (_, snapshot) {
    if (snapshot.hasError) return Text('Error listening document: ${snapshot.error}');
    if (!snapshot.hasData) return const CircularProgressIndicator();
    final doc = snapshot.data!;
    return Text('Current doc: ${doc.data()}');
  }
)
```

But in our use-case above, we didn't want to use the document in a UI. Rather we want to wait for the document to appear, so we want to use `await` on it. And that's not possible with (just) a realtime listener.

Instead we'll write a helper function that translates the `Stream` from the realtime listener into a `Future` that we need for `await`. Based on what we've seen so far with `listen`, that'd be:
  ```dart
  Future<DocumentSnapshot> waitForDocument(DocumentReference ref) {
    final completer = new Completer<DocumentSnapshot>();

    StreamSubscription? sub;
    try {
      sub = ref.snapshots().listen((snapshot) {
        if (snapshot.exists) {
          completer.complete(snapshot);
          sub!.cancel();
        }
      });
    }
    catch (e) {
      completer.completeError(e);
    }

    return completer.future;
  }
  ```

It's a bit longer than I wanted it to be, but it should be pretty straightforward to follow once you know that:

 *  We need to cancel the listener once the document has been created, so we track the subscription (in `sub`).
 * A `Completer` is an object that allows you to build your own `Future`.

Now with this, we can wait for our document to appear without a hard-coded delay:
```dart
final cred = await FirebaseAuth.instance.signInAnonymously();
final user = cred.user!;
final doc = await waitForDocument(FirebaseFirestore.instance.doc(user.uid));
```

What's not yet handled here is the case where document creation has not completed after 15 seconds. To add that, we'd need to implement a timeout. Let me know (on the socials I linked above) if that's something you need.

You can find a working copy of this code and a (much shorter) explanation on https://zapp.run/edit/firestore-wait-for-doc-creation-zx5k06w7x5l0.

---

**Update**: [Luke](https://x.com/luke_pighetti) [pointed out](https://x.com/luke_pighetti/status/1819740405979570389) that the `firstWhere` operation on `Stream` that does almost the same. Using that, we can reduce `waitForDocument` to just this:
  ```dart
  Future<DocumentSnapshot> waitForDocument(DocumentReference ref) {
    return ref.snapshots().firstWhere((snapshot) => snapshot.exists);
  }
  ```

The calling code remains the same, and gets the same benefits - so this is just a much shorter implementation of `waitForDocument`. 🎉