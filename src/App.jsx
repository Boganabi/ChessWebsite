
import { useState, useEffect } from 'react'
import { Chess } from "chess.js"
import { Chessboard } from 'react-chessboard';
import './App.css';
import SettingsBar from './SettingsBar';

// using chess board from https://www.npmjs.com/package/react-chessboard
// will use help from https://www.chessprogramming.org/Main_Page 

function App() {

  const [game, setGame] = useState(new Chess());
  const [gamefen, setGameFen] = useState();
  const [chessboardSize, setChessboardSize] = useState(560);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerColor, setPlayerColor] = useState("white");
  const [currentTurn, setCurrentTurn] = useState("white")

  // start stockfish web worker
  const stockfish = new Worker("./stockfish.js");
  stockfish.postMessage("uci");
  // stockfish.postMessage("setoption name multipv value 3"); // to set number of top moves to return
  const DEPTH = 1; // number of halfmoves for engine to look ahead

  useEffect(() => {
    function handleResize(){
      const display = document.getElementsByClassName("boardwrapper")[0];
      if(display.offsetHeight != 0){
        setChessboardSize(display.offsetHeight);
      }
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [])

  function startStockfish() {
    const gameCopy = new Chess();
    gameCopy.loadPgn(game.pgn());
    setGame(gameCopy);
    setGameFen(gameCopy.fen());
  }

  useEffect(() => {
    if(gamefen){
      const possibleMoves = game.moves();
      if(game.isCheckmate()){
        console.log("Checkmate!");
      }
      if(game.isDraw()){
        console.log("Draw!");
      }
      if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0)
        return; // exit if the game is over

      makeEngineMove();
    }
  }, [gamefen]);

  function makeEngineMove() {
    if(currentTurn != playerColor){
      stockfish.postMessage("position fen " + gamefen);
      stockfish.postMessage("go depth " + DEPTH);
      stockfish.onmessage = (e) => {
        // console.log(e.data); // this will show the best move in the console
        if(e.data.split(" ")[0] == "bestmove"){
          const move = e.data.split(" ")[1];
          const sourceSquare = move.slice(0, 2);
          const targetSquare = move.slice(2, 4);
          setCurrentTurn(playerColor == "white" ? "white" : "black");
          const engine_move = makeAMove({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q", // always promote to a queen for example simplicity
          });
      
          // illegal move
          if (engine_move === null) return false;
      
          if (!gameStarted) setGameStarted(true);
        }
      };
    }
  }

  function makeAMove(move) {
    const gameCopy = new Chess();
    gameCopy.loadPgn(game.pgn());
    const result = gameCopy.move(move);
    setGame(gameCopy);
    if(result){
      setGameFen(gameCopy.fen());
    }
    return result; // null if the move was illegal, the move object if the move was legal
  }

  function onDrop(sourceSquare, targetSquare) {
    if(currentTurn == playerColor){
      const move = makeAMove({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // always promote to a queen for example simplicity
      });
  
      // illegal move
      if (move === null) return false;
  
      if (!gameStarted) setGameStarted(true);
  
      setCurrentTurn(playerColor == "white" ? "black" : "white");
      return true;
    }
    else{
      return false;
    }
  }

  // also need to implement the onpiececlick and onsquarerightclick
  return (
    <>
      {!gameStarted && <SettingsBar changeColor={setPlayerColor} start={() => { startStockfish(); setGameStarted(true); }}/> }
      <div className="boardwrapper">
        <Chessboard boardWidth={chessboardSize} position={game.fen()} onPieceDrop={onDrop} boardOrientation={playerColor} />
      </div>
    </>
  )
}

export default App
