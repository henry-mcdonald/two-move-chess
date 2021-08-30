two-move chess

Based substantially on the work of the Great Maurice Conrad, author of the npm package chessboard-engine

https://github.com/MauriceConrad/Chess

As well as the work of T. Freeman, Chess Variant Author:

https://www.chessvariants.com/invention/two-move-chess

Not fully implemented -- stay tuned

Currently deployed to this link:

https://chess-engine-henry.herokuapp.com/

Play with post requests like:

{
    "player":"p1",
    "from":"d5",
    "to":"e4"
}

Post to */move

check the colors of the playrs in the json packet at the bottom to know who is what color