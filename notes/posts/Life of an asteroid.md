When speaking at conferences, I like to build a small, classic game that we then turn into a multi-player experience by wiring it up to a hosted backend (typically Firebase). Recently I decided to do that for the classic [Asteroids game][asteroids]. In case you've never seen Asteroids, here's a cap from its original arcade version back in 19XX:

[Asteroids arcade]

And here's the Flutter game that I generated in DreamFlow:

[DreamFlow play]

While I used an LLM text-to-app tool to generate the initial game, I added all of the multiplayer bits interactively in VS Code and Cursor. It turns out these tools are also *Really* handy to learn the ins and outs of a code base you're not familiar with.... like the game you just had an LLM generate for you. 😊

## Game loops

Games typically use a mechanism called a game loop. This is a loop that runs frequently (like 20-60 times per second), updates every game object, and then renders them all to the screen.

## Wrapping the game world

## Persisting game state

## It's all corners all the way down

## Wrapping in a long-term persisted game world



[asteroids]: 