"use strict";
var fs = require("fs");

const p1Name = 'p1'
const p2Name = 'p2'



module.exports = {


  print: function(gameInstance, type) {
    type = type != undefined ? type : "console"
    var shorts = {
      pawn: "♟",
      rook: "♜",
      knight: "♞",
      bishop: "♝",
      king: "♚",
      queen: "♛"
    }
    var bgColorNumber = 43
    var descrColorNumber = 31
    var rows = Object.keys(gameInstance.board)
    var boardStr = "\n\n"
    var seperateLine = "";
    var linePlainStr = "";
    (function () {
      var rows = Object.keys(gameInstance.board).length;
      for (var i = 0; i < rows; i++) {
        linePlainStr += "    ";
        seperateLine += "____";
      }
    })();
    for (var i = 0; i < rows.length; i++) {
      var line = "\x1b[" + bgColorNumber + "m\x1b[" + descrColorNumber + "m " + (gameInstance.board[Object.keys(gameInstance.board)[0]].length - i) + "\x1b[39m |"
      for (var a = 0; a < rows.length; a++) {
        var currpiece = gameInstance.pieces[gameInstance.board[rows[a]][i]]
        line += "  " + (typeof gameInstance.board[rows[a]][i] == "number" ? ((currpiece.color == "black" ? "\x1b[30m" : "\x1b[97m") + shorts[currpiece.type]) : "\x1b[30m⊚") + " "
      }
      boardStr += line + "\x1b[30m\x1b[49m\n\x1b[" + bgColorNumber + "m   " + (type === "text" ? "  " : "") + "|" + ((i + 1) >= rows.length ? (seperateLine + (type === "text" ? "________" : "")) : linePlainStr) + "\x1b[49m\n"
    }
    var letters = "";
    Object.keys(gameInstance.board).forEach(function(row) {
      letters += "  " + row.toUpperCase() + (type === "text" ? "    " : " ")
    })
    boardStr += "\x1b[" + bgColorNumber + "m \x1b[" + descrColorNumber + "m" + (type === "text" ? "       " : "   ") + letters + "\x1b[39m\x1b[49m\n\n"
    boardStr = type === "text" ? boardStr.replace(/(\[)[0-9]{2}m/g, " ") : boardStr
    return boardStr
  },
  exportSVG: function(gameInstance,message) {
    var length = Object.keys(gameInstance.board).length >= gameInstance.board[Object.keys(gameInstance.board)[0]].length ? Object.keys(gameInstance.board).length : gameInstance.board[0].length;
    var fieldSize = [10, 10];
    var svgStart = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ' + (length * fieldSize[0]) + ' ' + (length * fieldSize[1]) + '">\n  <style>\n    .white {\n      fill: #fff;\n    }\n    .black {\n      fill: #735e48;\n    }\n  </style>\n';
    var gameInfo = '<text>Hello and welcome</text>'
    var svgContext = '';
    var svgEnd = '</svg>';
    var iconPath = __dirname + "/default/svg/";
    var pieces = {
      white: {
        pawn: fs.readFileSync(iconPath + "farmer-white.svg", "utf8"),
        rook: fs.readFileSync(iconPath + "tower-white.svg", "utf8"),
        knight: fs.readFileSync(iconPath + "jumper-white.svg", "utf8"),
        bishop: fs.readFileSync(iconPath + "runner-white.svg", "utf8"),
        king: fs.readFileSync(iconPath + "king-white.svg", "utf8"),
        queen: fs.readFileSync(iconPath + "queen-white.svg", "utf8")
      },
      black: {
        pawn: fs.readFileSync(iconPath + "farmer-black.svg", "utf8"),
        rook: fs.readFileSync(iconPath + "tower-black.svg", "utf8"),
        knight: fs.readFileSync(iconPath + "jumper-black.svg", "utf8"),
        bishop: fs.readFileSync(iconPath + "runner-black.svg", "utf8"),
        king: fs.readFileSync(iconPath + "king-black.svg", "utf8"),
        queen: fs.readFileSync(iconPath + "queen-black.svg", "utf8")
      }
    }
    var size = 0.75;
    Object.keys(gameInstance.board).forEach(function(row) {
      var rowStr = '  <g class="row" data-row="' + row + '">\n' + (function() {
        var fields = '';
        for (var i = 0; i < gameInstance.board[row].length; i++) {
          var pieceId = gameInstance.board[row][i];
          var coords = [Object.keys(gameInstance.board).indexOf(row), i];
          if (typeof pieceId == "number") {
            var pieceContext = '<svg xmlns="http://www.w3.org/2000/svg" width="' + (fieldSize[0] * size) + 'px" height="' + (fieldSize[1] * size) + 'px" x="' + (coords[0] * fieldSize[1] + (fieldSize[0] / 2 - (fieldSize[0] * size / 2))) + 'px" y="' + (i * fieldSize[0] + (fieldSize[1] / 2 - (fieldSize[1] * size / 2))) + 'px">\n\n' + pieces[gameInstance.pieces[pieceId].color][gameInstance.pieces[pieceId].type] + '\n\n</svg>';
          }
          else {
            var pieceContext = "!!!";
          }
          fields += '    <rect x="' + (coords[0] * fieldSize[1]) + '" y="' + (i * fieldSize[0]) + '" width="' + fieldSize[0] + 'px" height="' + fieldSize[1] + 'px" class="field ' + (((coords[0] + coords[1]) % 2) == 0 ? "white" : "black") + '" data-coords="' + coords[0] + ',' + coords[1] + '" data-field="' + row + (gameInstance.board[row].length - i) + '"/>\n';
          fields += '    ' + pieceContext + '\n';

        }
        return fields
      })() + '  </g>';
      svgContext += rowStr + "\n";
    });
    var svgContent =  svgStart +  svgContext + svgEnd +  JSON.stringify(message);
    return svgContent
  }
}
