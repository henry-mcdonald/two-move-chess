# Chessboard

Node.js module to control the logic of a chess board.

## Require

```javascript
var chess = require("chessboard");
```

### Chess Instance
```javascript
{
  board: [Object],    // Located in  "/default/board.json"
  pieces: [Array],  // Located in  "/default/pieces.json"
  rules: [Object],    // Located in  "/default/rules.json"
  Game: [Function]
}
```

This returns the general chess instance containing the Game() prototype and objects containing board, pieces and rules.
These three objects are loaded from external files and may be used by the Game() prototype to get a board, pieces or rules.

Before we see how the module works in general, let#s have a look at the structure of these three objects.

#### Board

It has keys from a-h that are containing an array with 8 items. Each item represents 'false' or the **id** of a pieces (Pieces are declared in the *pieces* object).
If it's '_false_', the field is empty.

```javascript
board: {
  a: [8, 0, false, false, false, false, 16, 24],
  b: [10, 1, false, false, false, false, 17, 26],
  c: [12, 2, false, false, false, false, 18, 28],
  d: [15, 3, false, false, false, false, 19, 31],
  e: [14, 4, false, false, false, false, 20, 30],
  f: [13, 5, false, false, false, false, 21, 29],
  g: [11, 6, false, false, false, false, 22, 27],
  h: [9, 7, false, false, false, false, 23, 25]
}
```

#### Pieces

It's an array containing objects who describe the piece.
The index of an item represents it's **id**.

```javascript
pieces: [
  { type: "pawn", color: "black" }, // ID: 0
  { type: "pawn", color: "black" }, // ID: 1
  { type: "pawn", color: "black" }, // ID: 2
  { type: "pawn", color: "black" }, // ID: 3
  { type: "pawn", color: "black" }, // ID: ...
  { type: "pawn", color: "black" }, // ...
  { type: "pawn", color: "black" },
  { type: "pawn", color: "black" },
  { type: "rook", color: "black" },
  { type: "rook", color: "black" },
  { type: "knight", color: "black" },
  { type: "knight", color: "black" },
  { type: "bishop", color: "black" },
  { type: "bishop", color: "black" },
  { type: "king", color: "black" },
  { type: "queen", color: "black" },
  { type: "pawn", color: "white" },
  { type: "pawn", color: "white" },
  { type: "pawn", color: "white" },
  { type: "pawn", color: "white" },
  { type: "pawn", color: "white" },
  { type: "pawn", color: "white" },
  { type: "pawn", color: "white" },
  { type: "pawn", color: "white" },
  { type: "rook", color: "white" },
  { type: "rook", color: "white" },
  { type: "knight", color: "white" },
  { type: "knight", color: "white" },
  { type: "bishop", color: "white" },
  { type: "bishop", color: "white" },
  { type: "king", color: "white" },
  { type: "queen", color: "white" },
  { type: "queen", color: "black" }
]
```

#### Rules

It's an object containing objects that describe the rules for a _type_ of _pieces_.
The rule definition for a _type_ of _pieces_ has a few properties:

```javascript
rules: {
  pawn: {
    directions: ["forward"],
    ratio: [0],
    max: 1,
    special: ["checkUnused", "farmerHits"]
  },
  rook: {
    directions: ["forward", "backward", "left", "right"],
    ratio: [0],
    max: false,
    special: ["checkCastling"]
  },
  knight: {
    directions: ["forward", "backward", "left", "right"],
    ratio: [0.5, 2],
    max: 2,
    jump: true
  },
  bishop: {
    directions: ["forward", "backward", "left", "right"],
    ratio: [1],
    max: false
  },
  king: {
    directions: ["forward", "backward", "left", "right"],
    ratio: [0, 1],
    max: 1,
    special: ["checkCastling"]
  },
  queen: {
    directions: ["forward", "backward", "left", "right"],
    ratio: [0, 1],
    max: false
  }
}
```

##### How they're interpreted?
Within the module, there is a function that checks a lot of things. For example, whether the direction is allowed, the maximum amount of steps is okay, the ratio is possible for this _type_ of piece and whether the way is clear. (If _jump_ is **true**, the way doesn't matters).
The next thing is the property _special_ that contains an array with method names. This methods are individual methods to manage more complicated rules because it's not possible to explain such a complex rule like _castling_ just in JSON.

##### Properties
```javascript
{
  directions: [Array], // All allowed directions for the movement. | "forward" || "backward" || "left" || "right"
  ratio: [Array], // All allowed ratios (X / Y proportion) | 0 = straight into one direction (rook) | 1 = bidirectional (bishop)  | 0.5/2 = knight
  max: [Number], // Maximum amount of steps to go | pawn = 1 | King = 1 | knight = 2
  jump: [Boolean], // If jumping is allowed | Means that it's not necessary if the way to the target field is clear
  special: [Array] // Containing special functions to control a complex kind of rule. You'll find more information about the way how this functions work below
}
```

This is the connection between these three things (pieces, board & rules).

## Create a Game

```javascript
var game = new chess.Game();
```

A Game() contains it's own board, pieces and rules. If you don't pass custom ones, the Game() Function clones board, pieces and rules from the general chess instance.


### Custom Board, Pieces or Rules

There are three ways to set custom board, pieces or rules:
1. Change the board, pieces or rules within the general chess instance before you create a new Game()
2. The instance of a Game() contains it's own board, pieces and rules (Mostly cloned from the general chess instance). You can change these things every time. There is no reinitialization required.
3. Pass them as arguments to the Game() prototype function


### Game Instance

The instance you get from Game() contains it's own board, pieces and rules.
There are also some methods to interact with the board or to print/export the chess board.

```javascript
game: {
  board: [Object], // The current board of the game
  pieces: [Array], // The list of pieces of the game. | The amount of moves is saved within the piece object
  rules: [Object], // The used rules for validating moves
  specialRules: [Object], // The special functions that are used for managing complicated rules
  print: [Function], // Returns a simple text based output of the current board. (First argument can be "console" or "text". Default is "console". If it's "text" the output doesn't contains styling rules for the console)
  exportSVG: [Function], // Returns a SVG context of the current board.
  move: [Function], // Take a move (You'll find more details below)
  getTargets: [Function], // Returns all possible target fields for a piece (You'll find more details below)
  getAttacks: [Function] // Returns all possible attacks to a piece (You'll find more details below)
}
```

#### Move

To move a piece on the board, use the _move()_ method of a Game() Instance.
The first argument is an object containing options.
The _from_ and _to_ keys are required. Anything else wouldn't make any sense.

```javascript
var myMove = game.move({
  from: "d2", // Required | The field whom the piece comes from (Field must contain a piece! Otherwise you'll get an error)
  to: "c4", // Required | The target field
  rules: true, // Default is 'true' | If the board looks for the rules. If your move is not allowed 'success' in the return object of 'move()' will be 'false'. There will be also an array 'errors' containing the broken rules
  test: false // Default is 'false' | If your move is just a test. That means, the board will not change
});
// Returns an object with some properties about the movement.
```

##### Move Return
```javascript
// If the move was successfully
{
  success: true, // If your move was successfully
  hit: { type: [String],
     color: [String],
     moves: [Number],
     id: [Number],
     row: [String],
     line: [Number],
     coords: [Array] } || false, // If you hit another piece. If, it's an object. If not it's just 'false'. The object will be a normal field object
  move: {
    way: [Array], // The fields in your way,
    step: [[Number], [Number]], // The ratio how the way was gone ([1, 0] || [0.5, 1] || [1, 2] [..., ...]),
    validation: { // Object containing the different properties needed to match with the rules
      obstacles: [Number], // How many pieces are in the way
      direction: [String], // The direction of your move
      ratio: [Number], // The ratio of X/Y steps
      max: [Boolean], // If the steps are allowed
      target: [Boolean] // If the target field is allowed (If the piece standing there has the same color as the piece you move it's not allowed!)
    },
    from: [String], // 'a1' || 'd6' || ...
    to [String], // 'a1' || 'd6' || ...
    targets: [Array], // Array containing fields to whom the piece might possibly move to (rule-compliant)
    attacks: [Array] // Array containing pieces who might be able to attack the new position
  }
}
// If the move was not successfully
{
  success: false, // Move was not successfully
  hit: false, // Of course, if you can't move you didn't hit any other piece...
  error: [Array] // Array containing errors which describes why the move doesn't matches the rules
}
```

#### getTargets()

To get possible targets for a piece, just run the getTargets() method of a game instance.
The only argument is the field on which the piece stands. 'a1' || 'd7'

```javascript
var targets = game.getTargets("a2");
// Returns an array containing the coordinates about the field and whether the move to this field might be a hit.

targets = [
  {
    field: [[String], [Number]], // [row, line] || ["a", "3"]
    coords: [[Number], [Number]], // [x, y] || [0, 5]
    hit: false || [Object] // If it's an empty field, 'hit' is 'false'. If the move is a possible hit, 'hit' contains a normal piece object
  },
  {
    ...
  }
]
```

#### getAttacks()

To get the possible attacks to a field, just run the getAttacks() method of a game instance.
The only argument is the field that could be attacked. 'a6' || 'f5'

```javascript
var attacks = game.getAttacks("a6");
// Returns an array containing the coordinates about the field and whether the move to this field might be a hit.

attacks = [
  {
    field: [[String], [Number]], // [row, line] || ["b", "7"]
    coords: [[Number], [Number]], // [x, y] || [1, 1]
    attacker: [Object] // A normal piece object containing the attacker
  },
  {
    ...
  }
]
```
