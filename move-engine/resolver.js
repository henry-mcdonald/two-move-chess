// const twoMove = require('./twoMove')

class playerEngine {

    constructor(players){
      let size = Object.keys(players).length
      if(size !== 2){
          throw `n of players ${size} must be 2, players is like ${players}`
        }
      
      let firstMover
      for(const [key,valule] of Object.entries(players)){
        if(valule.color === 'white'){
          firstMover = key
        }
      }
      if(!firstMover){
        throw 'could not find first mover'
      }
    //   console.log(`first mover like ${firstMover}`)
      this.moveCounter = 0
      this.movesRemaining = 1
      this.maxMoves = 2
      this.playerNames = Object.keys(players)
      this.currentMover = firstMover

    }

    playerCanMove = (playerToCheck) => {
      if(playerToCheck !== this.currentMover){
          console.log(`${playerToCheck} vs ${this.currentMover}`)
        return false
      } else{
          return true
      }
      
    }

    swapActivePlayer = () => {
        let moverToFlip = this.currentMover
        for(let i=0;i<2;i++){
            if(this.playerNames[i]!==moverToFlip){
                this.currentMover = this.playerNames[i]
            }
        }
    }

    increment = () => {
        if(this.movesRemaining ==2){
            this.movesRemaining = this.movesRemaining -1
        } else{
            this.swapActivePlayer()
            this.movesRemaining = 2
        }


    }






  }


module.exports = {

    checker: playerEngine

}