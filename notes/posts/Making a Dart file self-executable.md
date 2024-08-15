---
title: Making a Dart file self-executable
pubDate: August 16, 2024
alsoOn: [https://x.com/puf]
---

The normal way to run a Dart file without first compiling it is through the `dart run` command. For example, if we have a `bin/server.dart` file, we can run it with:
```bash
dart run bin/server.dart
```

This works of course, but you can also make the `bin/server.dart` file self-executable by adding a [shebang](https://en.wikipedia.org/wiki/Shebang_(Unix)) as the first line, and marking it as executable. So:
```dart
#!/usr/bin/env dart
import 'dart:io';
import 'package:http/http.dart' as http;

void main() async {
  ...
}
```
And then:
```bash
chmod +x bin/server.dart
```


With that, the `bin/server.dart` file becomes executable itself. So you can run it as:
```bash
bin/server.dart
```

And if you read my post on [Hot reload for Dart](/posts/hot-reload-for-dart), you can apply that here too:
```bash
nodemon -x bin/server.dart -e dart
```
