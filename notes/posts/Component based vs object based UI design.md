---
title: "UI design: object oriented vs component based"
pubDate: "January 22, 2025"
alsoOn: [https://bsky.app/profile/puf.io/post/3lggji5dp4t23, https://www.threads.net/@frankpuf/post/DFLaefmM_Yh, https://x.com/puf/status/1882497117840630044, https://c.im/@puf/113879107093629005, https://www.linkedin.com/posts/puf_httpspufiopostscomponent-based-vs-object-based-ui-design-activity-7288262961742168065-kObq/]
description: "Building a UI in object-oriented code often leads to deeply nested object structures, where each object has a single responsibility. Building a UI in a visual component-based builder typically leads to shallower structures with fewer objects, whose behavior is controlled by properties."
---

*Disclaimer: I first learned/came up with this classification 25+ years ago while working with Borland Delphi. I’ve recently been reapplying it while working with FlutterFlow, but it applies to other tools too. If you use a different classification, hit me up on the socials I linked above.*

#### My history with object oriented vs component based building of UI

*Skip to the next paragraph (Object oriented UI building with Flutter) if you don’t care about my personal history, you won’t miss anything major.*

When I got my computer science education (early ‘90s), we were schooled in pretty advanced structured programming, pretty classic OOP, and a dusting of functional programming.  The OOP was especially new to me at the time, and I applied it steadily (and maybe a bit dogmatically) early in my career.

I built my first UI library in Borland Pascal (the pro variant of [Turbo Pascal](https://en.wikipedia.org/wiki/Turbo_Pascal)) and applied my OOP teachings, ending up with many small classes each with a single purpose. In the code you'd then compose the necessary behavior out of those classes. The team was really small, and the use-case was well defined, so while we had many UI classes, teaching the team went pretty fast and we were able to put the library to good use.

Then I switched to a larger company and joined a team that built a UI framework for [Borland Delphi](https://en.wikipedia.org/wiki/Delphi_(software)) (the successor to Borland Pascal), and where we had many teams each building apps with that framework. 

![screenshot of Borland Delphi](https://upload.wikimedia.org/wikipedia/en/4/45/Screenshot_of_Delphi_10.4_IDE_with_VCL_designer_and_Dark_Theme.png)\
*Borland Delphi*

With Delphi  you built an app by dragging-and-dropping components from a palette onto your forms, rather than by (just) typing the code. This is when I started making a distinction between *libraries* (something you use in your app) and *frameworks* (something that you build your app in), and between **object based UI building** and **component based UI frameworks**.

 * **object based UI building** - you compose the UI out of many objects, each with only a few properties.
 * **component based UI frameworks** - you compose the UI out of fewer components, each with many properties that you can set to tweak its look and behavior.

I've always used this mental separation for object oriented UI building and component based UI building, but it's become more relevant again as I work with Flutter and now FlutterFlow.

#### Object oriented UI building with Flutter

When building an object-based UI the code consists of many objects, each with a single, well-defined purpose. You then build your application by composing these objects into bigger wholes.

If I look at plain Flutter code today, it reflects this object oriented model quite directly. An example of the composability is when you have a column of UI elements that takes up part of a screen. In Flutter this'd be a `Column` object.

```dart
Column(
  children: <Widget>[
    ...
  ]
)
```

If there’s more content than fits the available space, you want that column to scroll. In Flutter, you do this by wrapping the `Column` object in a `SingleChildScrollView` object. A neat composition on the code level.
```dart
body: Center(
  child: SingleChildScrollView(
    child: Colum(
      children: <Widget>[
        ...
      ]
    )
  ),
),
```
Runnable example on Zapp.run: https://zapp.run/edit/flutter-zcda06t8cdb0 

Note how simple this model is for each of the components. The `Column` gets to work with an infinitely long canvas and it can “just” stack all its items in there. And then the `SingleChildScrollView` takes that large canvas and (if needed) makes it fit into the screen viewport by “just” adding scrollbars. A good separation of concerns.

Sure, you often end up with much more deeply nested structures than you initially expect (seriously: check it in the [Flutter widget inspector](https://docs.flutter.dev/tools/devtools/inspector), or count the number of `child` and `children` properties you have) - but the separation of concerns is beautiful.

![The Flutter widget inspector](https://docs.flutter.dev/assets/images/docs/tools/devtools/inspector_screenshot.png)\
*Flutter widget inspector*

That said, I’m often a bit intimidated when I open the code for an existing Flutter app for the first time: there are usually *a lot* of widgets, and a lot of nesting. This is a conscious decision that Flutter's creators made: they built a framework with *many* composable objects, and we’re all benefiting from it. We have to be honest though: **Flutter is a verbose UI framework**. If you love Flutter, there’s a lot to love there. :)

---

But if you were to map this 1:1 to a visual UI builder where users can drag-and-drop the UI elements from a palette, you end up with *a lot* of elements. Seriously: basic Flutter has over 200 [built-in widgets](https://docs.flutter.dev/reference/widgets), and there are thousands more on pub.dev to fit everyone’s needs.

Directly manipulating all those Flutter widgets in a UI builder may be feasible, but it won’t be very productive. Think back to the Flutter widget inspector for a moment and its deeply nested widget trees. Imagine building a UI by manipulating that widget tree. It’s certainly possible, but it won’t be a very visual experience anymore. For an effective visual UI building tool, we need UI components that represent a higher level of abstraction.

#### Component based UI building with FlutterFlow

A component-based UI tree consists of a lot fewer components, but each of them has many more properties to control their behavior. So we’re still building a tree of UI elements, but each element typically is a larger fraction of the total behavior.

*As I said above, I learned this model with Borland Delphi decades ago, and  many others probably know it from Visual Basic (VB6 anyone?), but I'll focus on FlutterFlow here, mostly because using FlutterFlow brought all of this back for me.*

FlutterFlow is a visual UI builder that builds on top of Flutter. You build your UI out of components that FlutterFlow also calls widgets, and if we search in its list we find our familiar `Column` widget.

![screenshot of FlutterFlow Column in widget list](https://i.imgur.com/BvXdwzt.png)

Assuming that once again we have a dynamic list of data that may not fit the device’s screen, and we display it in a `Column`. How do we make it scrollable now?

Well, the FlutterFlow `Column` component has a property Scrollable that we can toggle on.

![Screenshot of FlutterFlow Column scrollable property](https://i.imgur.com/4nJjXO2.png)

The orange arrows point out the key elements here:

1. I've selected a `Column` component/widget here
2. This component has properties that are specific to a `Column` (I've hidden most other properties here)
3. One of those properties determines whether the component is scrollable.

Under the hood, this property translates 1:1 to the Flutter code we saw earlier: when the Scrollable toggle is off, you get just the Column:

```dart
body: Center(
  child: Colum(
    children: <Widget>[
      ...
    ]
  ),
),
```
And when you toggle Scrollable on, FlutterFlow generates a `SingleChildScrollView` around the Flutter `Colum` widget.
```dart
body: Center(
  child: SingleChildScrollView(
    child: Colum(
      children: <Widget>[
        ...
      ]
    )
  ),
),
```

So depending on how you set its properties, the single `Colum` in FlutterFlow may generate multiple Flutter widgets. In fact, our `Colum` higher-level component generates a `SingleChildScrollView` > `Column` branch in our Flutter widget tree. And if we change the padding and alignment, we’ll see even more Flutter widgets coming out of our single `Colum` component.

I find this a useful distinction between code based UI building and visual UI building: **in a visual UI builder we work with fewer, higher-level objects**, which I’ve called components here. 

Having fewer, more configurable components makes them easier to manipulate in the UI builder tool such as FlutterFlow. Given that FlutterFlow generates Flutter code, it still creates the more verbose widget tree that you'd get from hand-coding the Flutter widget tree.