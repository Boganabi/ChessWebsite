
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
  const [lastMove, setLastMove] = useState();
  const [chessboardSize, setChessboardSize] = useState(560);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerColor, setPlayerColor] = useState("white");
  const [currentTurn, setCurrentTurn] = useState("white");
  const [useStockfish, setUseStockfish] = useState("stockfish"); // have button to choose the engine later
  const [engine, setEngine] = useState();

  const DEPTH = 1; // number of halfmoves for engine to look ahead

  // handles selection of engine
  useEffect(() => {
    let stockengine;
    
    // terminate a worker that might already be running
    if (engine !== undefined) engine.terminate();
    if(useStockfish === "stockfish"){
      // start stockfish web worker
      // const stockfish = new Worker("./stockfish.js");
      stockengine = new Worker("./stockfish.js");
      stockengine.postMessage("uci");
      // stockfish.postMessage("setoption name multipv value 3"); // to set number of top moves to return
    }
    else if(useStockfish === "fishy"){
      // const fishy = new Worker("./somethingFishy.js");
      // fishy.postMessage("hello");
      // fishy.onmessage = (e) => {
      //   console.log(e.data);
      // }
      // stockengine = new Worker(new URL("./somethingFishy.js", import.meta.url), { type: "module" });
      // stockengine = new Worker("./somethingFishy.js", { type: "module" });
      stockengine = new Worker("./somethingFishy.js");
      // const workaroundLib = new Chess();
      // stockengine.postMessage(workaroundLib);
      // stockengine.postMessage("position fen " + gamefen);
      // stockengine.postMessage("go depth " + DEPTH);
    }

    setEngine(stockengine);
  }, [useStockfish])

  useEffect(() => {

    function handleResize(){
      const display = document.getElementsByClassName("boardSizer")[0];
      if(display.offsetWidth != 0 && display.offsetHeight != 0){
        if(display.offsetWidth < window.innerHeight * 0.75){
          setChessboardSize(display.offsetWidth);
        }
      }
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("fullscreenchange", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("fullscreenchange", handleResize);
    }
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
        alert("Checkmate!");
      }
      if(game.isDraw()){
        console.log("Draw!");
        alert("Draw!");
      }
      if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0)
        return; // exit if the game is over

      makeEngineMove();
    }
  }, [gamefen]);

  function makeEngineMove() {
    if(currentTurn != playerColor){
      engine.postMessage("position fen " + gamefen);
      engine.postMessage("go depth " + DEPTH);
      engine.onmessage = (e) => {
        console.log(e.data); // this will show the best move in the console
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
      engine.onerror = (e) => {
        console.error(e);
      }
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
      setLastMove(move.lan);
      return true;
    }
    else{
      return false;
    }
  }

  // also need to implement the onpiececlick and onsquarerightclick
  // add resign button
  return (
    <>
      {!gameStarted && <SettingsBar changeColor={setPlayerColor} start={() => { startStockfish(); setGameStarted(true); }} chooseEngine={setUseStockfish} /> }
      <div className="boardwrapper">
        <div className="boardSizer">
          <Chessboard boardWidth={chessboardSize} position={game.fen()} onPieceDrop={onDrop} boardOrientation={playerColor} />
        </div>
      </div>
    </>
  )
}

export default App
