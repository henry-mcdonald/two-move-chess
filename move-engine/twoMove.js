"use strict";
var fs = require("fs")
module.exports = {

    Engine: class playerEngine {

      constructor(players){
        let size = Object.keys(players).length
        if(size !== 2){throw `n of players ${size} must be 2`}
        
        let firstMover
        for(const [key,valule] of Object.entries(players)){
          if(valule.color === 'white'){
            firstMover = key
          }
        }
        if(!firstMover){
          throw 'could not find first mover'
        }
        this.currentMover = firstMover
        this.moveCounter = 0
        this.movesRemaining = 1
        this.maxMoves = 2
      }

      this.playerCanMove = function (playerToCheck) {
        if(playerToCheck !== currentMover){
          return false
        }
        
      }






    }

}
String.prototype.firstCharToUpperCase = function() {
  return this.charAt(0).toUpperCase() + this.substring(1)
}
