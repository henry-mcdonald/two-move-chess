"use strict";
var fs = require("fs")
module.exports = {
  board: JSON.parse(fs.readFileSync(__dirname + "/default/board.json", "utf8")),
  pieces: JSON.parse(fs.readFileSync(__dirname + "/default/pieces.json", "utf8")),
  rules: JSON.parse(fs.readFileSync(__dirname + "/default/rules.json", "utf8")),
  Game: function() {
    var gameInstance = this
    this.board = module.exports.board
    this.pieces = module.exports.pieces
    this.pieces.forEach(function(piece) {
      piece.moves = piece.moves != undefined ? piece.moves : 0
    });
    this.rules = module.exports.rules
    this.specialRules = {
      checkUnused: function(move, way, valid) {
        var fromField = getPiece(move.from)
        if (fromField.moves <= 0 && way.length - 1 <= 2 && valid.ratio.ratio === 0) {
          return {
            max: true
          }
        }
      },
      checkCastling: function(move, way, valid) {

      },
      farmerHits: function(move, way, valid) {
        var fromField = getPiece(move.from)
        var toField = getPiece(move.to)
        var diff = getDiff(fromField, move.to)
        if (toField.color) {
          if (toField.color != fromField.color) {
            if (valid.ratio.ratio == 0) {
              return {
                ratio: { allowed: false, ratio: 0 }
              }
            }
            else if (valid.ratio.ratio == 1 && ((fromField.color == "black" && diff[1] >= 0) || (fromField.color == "white" && diff[1] < 0))) {
              return {
                ratio: { allowed: true, ratio: 1 },
                direction: { allowed: true, direction: "forward"}
              }
            }
          }
        }
      }
    }
    var exportMethods = require(__dirname + "/export.js");
    this.print = function() {
      return exportMethods.print(gameInstance, "console");
    };
    this.exportSVG = function(message) {
      return exportMethods.exportSVG(gameInstance,message);
    }
    function getPiece(field) {
      var row = field.substring(0, 1).toLowerCase()
      var line = parseInt(field.substring(1))
      try {
        var pieceId = gameInstance.board[row][gameInstance.board[row].length - line]
      } catch (e) {
        return "invalid"
      }
      if (pieceId == undefined) return "invalid"
      var piece = pieceId === false ? "empty" : ({
        type: gameInstance.pieces[pieceId].type,
        color: gameInstance.pieces[pieceId].color,
        moves: gameInstance.pieces[pieceId].moves,
        id: pieceId,
        row: row,
        line: line,
        coords: getCoords(row, line)
      })
      return piece
    }
    function setField(field, pieceId) {
      var row = field.substring(0, 1).toLowerCase()
      var line = parseInt(field.substring(1))
      gameInstance.board[row][gameInstance.board[row].length - line] = pieceId
    }
    this.move = function(move,playerColor,lastPieceMoved) {

      move.rules = move.rules == undefined ? true : move.rules
      move.test = move.test == undefined ? false : move.test
      
      // if(!move.player){
      //   return `not valid.. ${must specify player name in the move}`
      // }


      var from = getPiece(move.from)
      var to = getPiece(move.to)
      if(from === 'invalid'){
        return `${move.from} is not valid`
      }
      if (from === "empty"){
        return `no piece on ${move.from}`
      }
      if (to ==='invalid'){
        return `${move.to} is not valid`
      }
      if( from.color !== playerColor){
        return `mismatch between piece color and player color`
      }
      if(from.id === lastPieceMoved){
        return `you can't move the same piece twice!!!!`
      }


      var result = {
        success: true,
        hit: false
      }
      var rulesValidation = rulesValid(move)
      var errors = []
      var valid = rulesValidation.way.validation;
      (function() {
        if (valid.obstacles > 0) errors.push("Way is blocked")
        if (valid.direction.allowed != true) errors.push("Direction is not allowed")
        if (valid.ratio.allowed != true) errors.push("Not allowed to move so")
        if (valid.max != true) errors.push("Too many fields")
        if (valid.target != true) errors.push("Target is blocked")
      })()
      // function getPlayerColor(){
      //   return move.player.color
      // }
      // let playerColor = getPlayerColor()
      // if(playerColor !== from.color){
      //   result.success = false
      //   errors.push(`player color is ${playerColor} while piece color is ${from.color}`)

      // }

      if (move.rules === true) {
        result.success = result.success && rulesValidation.success
        if (result.success === true) setMove()
        else result.error = errors
      }
      else setMove()
      function setMove() {
        if (to != "empty") result.hit = to
        result.move = rulesValidation.way
        result.move.validation.direction = result.move.validation.direction.direction
        result.move.validation.ratio = result.move.validation.ratio.ratio
        if (move.test == false) {
          setField(move.to, from.id)
          setField(move.from, false)
          gameInstance.pieces[from.id].moves++
        }
        result.move.from = move.from
        result.move.to = move.to
        result.move.targets = getTargets(move.to)
        result.move.attacks = getAttacks(move.to)
        result.idOfPieceMoved = from.id
      }
      return result
    }
    this.getTargets = function(field) {
      return getTargets(field)
    }
    this.getAttacks = function(field) {
      return getAttacks(field)
    }
    function getCoords(row, line) {
      if (!line) {
        var field = row
        row = field.substring(0, 1).toLowerCase()
        line = parseInt(field.substring(1))
      }
      var x = Object.keys(gameInstance.board).indexOf(row)
      var y = gameInstance.board[row].length - line
      return [x, y]
    }
    function getDiff(from, to) {
      var row = to.substring(0, 1).toLowerCase()
      var line = parseInt(to.substring(1))
      var pieceCoords = from.coords
      var targetCoords = getCoords(row, line)
      var diff = [targetCoords[0] - pieceCoords[0], targetCoords[1] - pieceCoords[1]]
      return diff
    }
    function checkDirection(from, to, rules) {
      var directions = rules.directions
      var diff = getDiff(from, to)
      var absDiff = diff[0] + diff[1]
      var direction = Math.abs(diff[0]) >= Math.abs(diff[1]) ? (diff[0] >= 0 ? "right" : "left") : (diff[1] >= 0 ? (from.color == "black" ? "forward" : "backward") : (from.color == "black" ? "backward" : "forward"))
      var result = {
        allowed: false,
        direction: direction
      }
      if (rules.directions.indexOf(direction) > -1) result.allowed = true
      return result
    }
    function checkRatio(from, to, rules) {
      var diff = getDiff(from, to)
      var result = {
        allowed : false,
        ratio: Math.abs(diff[0] / diff[1]) == Infinity ? 0 : Math.abs(diff[0] / diff[1])
      }
      if (rules.ratio.indexOf(result.ratio) > -1) result.allowed = true
      return result
    }
    function getWay(from, to) {
      var fromField = getPiece(from)
      var diff = getDiff(fromField, to)
      var ratio = [Math.abs(diff[1]) / Math.abs(diff[0]), Math.abs(diff[0]) / Math.abs(diff[1])]
      if (Math.abs(diff[0]) >= Math.abs(diff[1])) {
        var steps = [diff[0] >= 0 ? 1 : -1, diff[1] >= 0 ? ratio[0] : -ratio[0]]
      }
      else {
        var steps = [diff[0] >= 0 ? ratio[1] : -ratio[1], diff[1] >= 0 ? 1 : -1]
      }
      var coords = fromField.coords
      var targetCoords = getCoords(to)
      var way = []
      var finished = false
      while (finished == false && true) {
        if ((Math.round(coords[0] * 10000) / 10000) == targetCoords[0] && (Math.round(coords[1] * 10000) / 10000) == targetCoords[1]) finished = true
        way.push([Math.round(coords[0]), Math.round(coords[1])])
        coords[0] += steps[0]
        coords[1] += steps[1]
      }
      return {
        way: way,
        step: steps
      }
    }
    function rulesValid(move) {
      var way = getWay(move.from, move.to)
      var fromField = getPiece(move.from)
      var rules = gameInstance.rules[fromField.type]
      var isValid = {
        obstacles: getObstacles(way, move, rules),
        direction: checkDirection(fromField, move.to, rules),
        ratio: checkRatio(fromField, move.to, rules),
        max: (rules.max >= (way.way.length - 1) ? true : (rules.max != false ? false : true)),
        target: getPiece(move.to).color === fromField.color ? false : true
      }
      if (rules.special) {
        rules.special.forEach(function(special) {
          var specialResult = gameInstance.specialRules[special](move, way.way, isValid)
          if (specialResult) {
            Object.keys(specialResult).forEach(function(keyName) {
              isValid[keyName] = specialResult[keyName];
            });
          }
        });
      }
      way.validation = isValid
      return {
        success: (isValid.obstacles == 0 && isValid.direction.allowed === true && isValid.ratio.allowed === true && isValid.max === true && isValid.target === true) ? true : false,
        way: way
      }
    }
    function getObstacles(way, move, rules) {
      var obstacles = 0
      for (var i = 0; i < way.way.length; i++) {
        var coords = way.way[i]
        if (i > 0 && i < way.way.length - 1) obstacles += getPiece(Object.keys(gameInstance.board)[coords[0]] + (gameInstance.board[Object.keys(gameInstance.board)[coords[0]]].length - coords[1])) === "empty" ? 0 : (rules.jump != true ? 1 : 0)
      }
      return obstacles
    }
    function inChess(move) {
      var targets = getTargets(move.to)
      return true
    }
    function getFieldRelation(fieldName, relation) {
      var field = getPiece(fieldName)
      if (field === "empty") {
        field = {
          row: fieldName.substring(0, 1).toLowerCase(),
          line: parseInt(fieldName.substring(1))
        }
      }
      var targets = []
      var rows = Object.keys(gameInstance.board)
      for (var i = 0; i < rows.length; i++) {
        for (var a = 0; a < gameInstance.board[rows[i]].length; a++) {
          var target = [rows[i], a + 1]
          var move = {
            from: (relation == "targets" ? (field.row + field.line) : (target[0] + target[1])),
            to: (relation == "targets" ? (target[0] + target[1]) : (field.row + field.line)),
            rules: true,
            test: true
          }
          if (getPiece(move.from) !== "empty") {
            var valid = rulesValid(move)
            if (valid.success) {
              var result = {
                field: target,
                coords: [i, gameInstance.board[rows[i]].length - target[1]],
                hit: getPiece(move.to)
              }
              if (relation === "attacks") {
                delete result.hit
                result.attacker = getPiece(move.from);
              }
              targets.push(result)
            }
          }
        }
      }
      return targets
    }
    function getTargets(field) {
      return getFieldRelation(field, "targets")
    }
    function getAttacks(field) {
      return getFieldRelation(field, "attacks")
    }
  }
}
String.prototype.firstCharToUpperCase = function() {
  return this.charAt(0).toUpperCase() + this.substring(1)
}
