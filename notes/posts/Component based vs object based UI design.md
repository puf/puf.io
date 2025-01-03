---
title: "UI design: object oriented vs component based"
pubDate: "December 30, 2029"
alsoOn: [https://x.com/puf]
description: "Building a UI in object-oriented code often leads to deeply nested object structures, where each object has a single responsibility. Building a UI in a visual component-based builder typically leads to shallower structures with fewer objects, whose behavior is controlled by properties."
---

*Disclaimer: I first learned/came up with this classification 25+ years ago while working with Borland Delphi. I’ve recently been reapplying it while working with FlutterFlow, but it applies to other tools too. If you use a different classification, hit me up on the socials I linked above.*

#### My history with object oriented vs component based building of UI

*Skip to the next paragraph (Object oriented UI building with Flutter) if you don’t care, you won’t miss anything major.*

When I got my computer science education (early ‘90s), we were schooled in pretty advanced structured programming, pretty classic OOP, and a dusting of functional programming.  The OOP was especially new to me at the time, and I applied it steadily (and maybe a bit dogmatically) early in my career.

I built my first UI library in Borland Pascal (the pro variant of [Turbo Pascal](https://en.wikipedia.org/wiki/Turbo_Pascal)) and applied my OOP teachings, ending up with many small classes each with a single purpose. In the code you'd then compose the necessary behavior out of those classes. The team was really small, and the use-case was well defined, so while we had many UI classes, teaching the team went pretty fast and we were able to put the library to good use.

Then I switched to a larger company and joined a team that built a UI framework for [Borland Delphi](https://en.wikipedia.org/wiki/Delphi_(software)) (the successor to Borland Pascal), and where we had many teams each building apps with that framework. 

![screenshot of Borland Delphi](https://upload.wikimedia.org/wikipedia/en/4/45/Screenshot_of_Delphi_10.4_IDE_with_VCL_designer_and_Dark_Theme.png)

With Delphi  you built an app by dragging-and-dropping components from a palette onto your forms, rather than by (just) typing the code. This is when I started making a distinction between *libraries* (something you use in your app) and *frameworks* (something that you build your app in), and between **object based UI building** and **component based UI frameworks**.

 * **object based UI building** - you compose the UI out of many objects, each with only a few properties.
 * **component based UI frameworks** - you compose the UI out of fewer components, each with many properties that you can set to tweak its look and behavior.

I've always used this mental separation for object oriented UI building and component based UI building, but it's become more relevant again as I work with Flutter and now FlutterFlow.

#### Object oriented UI building with Flutter

So in this model object-based UI code consists of many classes or objects, each with a single, well-defined purpose. You then build your application by composing these objects into bigger wholes.

If I look at plain Flutter code today, it reflects this object oriented model quite directly. An example of the composability is when you have a colum of UI elements that takes up part of a screen. If there’s more content than fits the available space, you want that column to scroll. In Flutter, you do this by wrapping the `Column` object in a `SingleChildScrollView` object. A neat composition on the code level.
```
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

Sure, you often end up with much more deeply nested structures than you initially expect (seriously: check it in the [Flutter widget inspector](https://docs.flutter.dev/tools/devtools/inspector), or count the number of `child` and `children` properties you have) - but that’s easily solved by building your own higher level, composable widgets.

That said, I’m often a bit intimidated when I open the code for an existing Flutter app for the first time: there are usually *a lot* of widgets, and a lot of nesting. This is a conscious decision that Flutter's creators made, and we’re all benefiting from it. We have to be honest though: **Flutter is a verbose UI framework**. If you love Flutter, there’s a lot to love there. :)

---

But if you were to map this 1:1 to a visual UI builder where users can drag-and-drop the UI elements from a palette, you end up with *a lot* of elements. Seriously: basic Flutter has over 200 [built-in widgets](https://docs.flutter.dev/reference/widgets), and there are thousands more on pub.dev to fit everyone’s needs.

Directly manipulating all those Flutter widgets in a UI builder may be feasible, but it won’t be very productive. Think back to the Flutter widget inspector for a moment and its deeply nested widget trees. Imagine building a UI by manipulating that widget tree. It’s certainly possible, but it won’t be a very visual experience anymore. For an effective visual UI building tool, we need UI components that represent a higher level of abstraction.

#### Component based UI building with FlutterFlow

A component-based UI tree consists of a lot fewer components, but each of them has many more properties to control their behavior. So we’re still building a tree of UI elements, but each element typically is a larger fraction of the total behavior.

FlutterFlow is a visual UI builder that builds on top of Flutter. It works based on widgets and if we search in its list we find our familiar `Column` widget.

![screenshot of FlutterFlow Column in widget list](https://i.imgur.com/BvXdwzt.png)

Assuming that once again we have a dynamic list of data that may not fit the device’s screen, and we display it in a `Column`. How do we make it scrollable now?

Well, the FlutterFlow `Column` component has a property Scrollable that we can toggle on.

![Screenshot of FlutterFlow Column scrollable property](https://i.imgur.com/4nJjXO2.png)

The orange arrows point out the key elements here:

1. I've selected a `Column` component/widget here
2. This component has properties that are specific to a `Column` (I've hidden most other properties here)
3. One of those properties determines whether the component is scrollable.

Under the hood, this property translates 1:1 to the Flutter code we saw earlier: when the Scrollable toggle is off, you get just the Column:

```
body: Center(
  child: Colum(
    children: <Widget>[
      ...
    ]
  ),
),
```
And when you toggle Scrollable on, FlutterFlow generates a `SingleChildScrollView` around the Flutter `Colum` widget.
```
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

```
TODO: Code sample of Colum with padding and alignment
```

This is the key distinction between code based UI building and visual UI building: **in a visual UI builder we work with fewer, higher-level objects**, which I’ve called components here. Having fewer, more configurable components to deal with makes them easier to manipulate in the UI builder tool.