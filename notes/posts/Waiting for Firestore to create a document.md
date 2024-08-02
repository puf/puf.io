---
title: Waiting for Firestore to create a document
pubDate: 
alsoOn: []
---

I recently saw this in a (Flutter) code-base:
```
final cred = await FirebaseAuth.instance.signInAnonymously();
final user = cred.user!;
Future.delayed(const Duration(seconds: 15);
final doc = await FirebaseFirestore.instance.doc(user.uid).getDoc();
```

I asked the engineer why there was a 15 second delay hard-coded in there, and it turns out there was some backend process (a Cloud Function in this case) that would create a document with (default) settings for the user, and they didn't know how long that would take.

This sort of code leads to all kinds of problems. The 15 seconds is a pretty safe upper limits, but typically document creation will take a lot less time - and you'll be waiting needlessly for the rest of the 15 seconds. And in the one case in a million where it takes more than 15 seconds to create the document, you're gonna have a hard time debugging it.

The better approach to this is to actually wait for the document to be created, and no longer. By using [Firestore's built-in realtime listeners]() is actually quite easy.
