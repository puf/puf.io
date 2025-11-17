---
title: Hot reload for Dart
pubDate: August 14, 2024
alsoOn: [https://x.com/puf/status/1823887619811655723, https://www.threads.net/@frankpuf/post/C-q-yQQvqfE, https://bsky.app/profile/puf.bsky.social/post/3kzptyapr5626, https://c.im/@puf/112963363684416756]
tags: [dart, hot-reload, nodemon]
---


I was writing a small Dart web server today, and got tired of constantly restarting it manually: <kbd>ctrl</kbd>-<kbd>\`</kbd>, <kbd>ctrl</kbd>-<kbd>c</kbd>, <kbd>up arrow</kbd>, <kbd>enter</kbd>. I mean, it's not a huge amount of work, but it adds up - and it's easy to miss a step (or all of them).

After searching and getting into the weeds of [how to do hot reload in Dart](https://www.reddit.com/r/dartlang/comments/66fiop/using_dart_vms_hot_reload_feature_to_build_an/) (which is what Flutter uses), I came across this [Reddit comment](https://www.reddit.com/r/dartlang/comments/mcsgrb/comment/gs5lqkn/) that shows a much simpler solution:
```bash
nodemon -x "dart run bin/server.dart" -e dart
```

In here:

* `nodemon` is the [application](https://github.com/remy/nodemon) that does the monitoring and executing.  Originally written for node, it works with any executable now.
* `-x "dart run bin/server.dart"` tells it to execute `dart run bin/server.dart`. Modify that last bit to point to your main Dart file.
* `-e dart` then tells it to monitor `.dart` files for changes. If it detects a change, it kills the current process and starts a new one.

Simple, but it works - so highly recommended.


