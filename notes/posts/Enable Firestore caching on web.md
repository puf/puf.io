---
title: "How to enable Firestore caching on web"
pubDate: "November 25, 2024"
alsoOn: [https://x.com/puf]
description: "Firestore can cache recently read documents in the client, to save on server-side document reads (which you pay for). On mobile SDKs this caching is enabled by default, but on the web SDK you have to enable it yourself. Read this post to learn how to enable this caching in JavaScript and Flutter."
---

According to ChatGPT: Firestore is a flexible, scalable NoSQL database offered by Google Firebase, designed for real-time, serverless applications. It provides powerful querying capabilities, **offline support**, and seamless synchronization of data across client devices.

Part of that offline support means that Firestore can cache recently read documents in the client and then return them from there on future reads. This means that the app will continue to work when the device has no internet connection, since it can fullfil read operations from its local cache. And since you don't pay for client-side reads, **having the cache enabled also saves you money** (or allows you to do *more* on a free project)

On Firebase's mobile SDKs this caching is enabled by default, but on the web SDK you have to enable it yourself before you first read or write documents. So: let's see how to turn on Firestore caching in JavaScript, Flutter, and FlutterFlow!

---

### Enabling caching in JavaScript

In the classic JavaScript SDK the call is:
```js
firebase.firestore().enablePersistence()
```
For the modular SDK (v9 and above) it's a bit more involved:
```js
initializeFirestore(app, 
    {localCache: 
    persistentLocalCache({tabManager: persistentMultipleTabManager()})
    });
```
There are more variants to specify where/how the data is cached, which is also why caching isn't enabled on web by default, but I find myself pretty exclusively using the above variants. To learn about all the options, read the documentation on [configuring offline persistence](https://firebase.google.com/docs/firestore/manage-data/enable-offline#web).


---

### Enabling caching in Flutter

In Flutter the call is similar, but you can only make this call when running on the web. So we'll detect whether we're running on web, and only then enable browser persistence:
```dart
if (kIsWeb) {
    await FirebaseFirestore.instance
        .enablePersistence(PersistenceSettings(synchronizeTabs: true));
}
```
*If you're new to this, read about [using the `kIsWeb` top-level constant](https://api.flutter.dev/flutter/foundation/kIsWeb-constant.html).*

I typically put this code in the `main` function in my `main.dart` file, before starting the app itself. That way we can be sure that it completes before the app first interacts with Firestore.

### Enabling caching in FlutterFlow

Finally, let's see how to enable this caching in [FlutterFlow](https://flutterflow.io), which is actually where I needed it myself.

**FlutterFlow is a visual UI builder**, so most of the time you don't actually write any code. That's why enabling the cache takes two steps:

1. create a custom action with the code we saw before
2. then call it as an initial action from main.dart

##### Create a custom action with the code

Since this is such a visual process, here's what it looks like on my screen:
![](https://i.imgur.com/rybJNHY.png)
Walking through these steps in text:
1. Go to the <kbd>Custom Code</kbd> panel in the left navigation bar
2. Create a new custom action by clicking <kbd>Add</kbd> at the top
3. Give the new custom action a name, which is how you'll be able to call it later
4. Copy/paste the code from above or below

I made the code a bit longer-but-narrower here from the plain Flutter code, but it does the same:
```dart
import 'package:flutter/foundation.dart' show kIsWeb;

Future enableFirestoreCachingOnWeb() async {
  final db = FirebaseFirestore.instance;
  if (kIsWeb) {
    // Local caching/persistence is enabled by default on all non-web clients
    try {
      await db
          .enablePersistence(const PersistenceSettings(synchronizeTabs: true));
    } catch (e) {
      // Enabling caching failed => continue without caching
      print('Error enabling Firestore cache: $e');
    }
  }
  print('Firestore cache enabled. Settings: ${db.settings}');
}
```
*Hmmm, I probably shouldn't swallow that error. 🤔*

Now that we have the custom action, let's call it from our `main.dart` file before the app runs.

##### Call the custom action as an initial action from main.dart

We remain in the same main screen in Flutter, but now do:
![](https://i.imgur.com/md5zZd4.png)
Steps:

1. Go to the <kbd>Custom Code</kbd> panel in the left navigation bar
2. Select the `main.dart` file.<br/>Unfortunately you can't edit the file, so...
3. Click <kbd>+</kbd> (Add Custom Action) and select the custom action we just made

Once you save and compile this, your FlutterFlow app will run the code *before* it starts the app, just like what we did for plain Flutter above.

FlutterFlow is working on making this the default behavior btw.

Also see:

* [Counting document reads per user on Firestore](/posts/counting-document-reads-in-firestore/), which is how I discovered that caching was not enabled for web clients of my app.