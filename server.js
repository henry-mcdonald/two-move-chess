"use strict";
var fs = require("fs");
var chess = require("./chessboard-engine/main");
var playerMoveValid = require("./move-engine/resolver");

const prompt = require('prompt-sync')();
const express = require('express');

const pleaseUpdate = "true"

const PORT = process.env.PORT || 8080
const HOST = '0.0.0.0'

const app = express()
app.use(express.json())

var game = new chess.Game();

let playersInGame = {
  "p1": {
  "color": "black",
  "alias": "Untouchable"
  },
  "p2": {
    "color" :"white",
    "alias": "The Grandmaster",
},
}


const moveTracker = new playerMoveValid.checker(playersInGame)


let gameOver = false;

let message
let lastMove = 'none'


app.get('/', (req, res) => {
  console.log("hit get route")
  try {
    message = {
      players: playersInGame,
      lastMove: lastMove
    }

    res.send(game.exportSVG(message))
  }
  catch (e) {
    console.log(e)
  }
})

app.post('/reset',(req,res) => {
  let player = req.req.body.user
  if(player !== 'henry'){
    res.json({response:`request denied for user ${player}! contact the admin please`})
  } else{
    game = new chess.game()
  }
})


app.post('/move', (req, res) => {
  console.log("hit move route")

  //check player exists
  try{

    let player = req.body.player
    let itIsPlayersTurn = moveTracker.playerCanMove(player)
    if(!itIsPlayersTurn){
      throw `${itIsPlayersTurn}does not seem to be player ${player}s turn to move`
    }
  } catch(e){
    console.log(e)
    res.json({error:e})
    return
  }



  //check that the piece is movable
  // try{

    

  // }
  // catch (e){
  //   console.log(e)
  //   res.send('error')

  // }

  try {
    let move = req.body
    let moveResult = game.move(move,playersInGame[move.player].color,lastMove.idOfPieceMoved)

    if(moveResult.success){
      moveTracker.increment()

      lastMove = moveResult
    } else{
      // lastMove='totally invalid amigo'
    }

    let response = {
      result:moveResult.success || 'not a valid move',
      moveRequest: req.body,
      fullDetails: moveResult
    }


    res.json({ response: response })
  }
  catch (e) {
    console.log('yes error',e)
    res.json({error:e})

  }
})

app.listen(PORT, HOST)
console.log(`RUNNING ON http://${HOST}:${PORT}`)