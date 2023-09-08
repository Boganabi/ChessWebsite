// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

import { useState, useEffect } from 'react'
import { Chess } from "chess.js"
import { Chessboard } from 'react-chessboard';
import './App.css';

// using chess board from https://www.npmjs.com/package/react-chessboard
// will use help from https://www.chessprogramming.org/Main_Page 

function App() {

  const [game, setGame] = useState(new Chess());
  const [chessboardSize, setChessboardSize] = useState(560);

  useEffect(() => {
    function handleResize(){
      const display = document.getElementsByClassName("boardwrapper")[0];
      // setChessboardSize(display.offsetWidth - 20);
      if(display.offsetHeight != 0){
        setChessboardSize(display.offsetHeight);
        // console.log(display.offsetWidth);
        // console.log(display.offsetHeight);
      }
    }

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [])

  function makeAMove(move) {
    const gameCopy = new Chess(); // { ...game };
    gameCopy.loadPgn(game.pgn());
    const result = gameCopy.move(move);
    setGame(gameCopy);
    return result; // null if the move was illegal, the move object if the move was legal
  }

  // function makeRandomMove() {
  //   const possibleMoves = game.moves();
  //   if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0)
  //     return; // exit if the game is over
  //   const randomIndex = Math.floor(Math.random() * possibleMoves.length);
  //   makeAMove(possibleMoves[randomIndex]);
  // }

  function onDrop(sourceSquare, targetSquare) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return false;
    // setTimeout(makeRandomMove, 200);
    return true;
  }

  return (
    <div className="boardwrapper">
      <Chessboard boardWidth={chessboardSize} position={game.fen()} onPieceDrop={onDrop} />
    </div>
  )

  // const [count, setCount] = useState(0)

  // return (
  //   <>
  //     <div>
  //       <a href="https://vitejs.dev" target="_blank">
  //         <img src={viteLogo} className="logo" alt="Vite logo" />
  //       </a>
  //       <a href="https://react.dev" target="_blank">
  //         <img src={reactLogo} className="logo react" alt="React logo" />
  //       </a>
  //     </div>
  //     <h1>Vite + React</h1>
  //     <div className="card">
  //       <button onClick={() => setCount((count) => count + 1)}>
  //         count is {count}
  //       </button>
  //       <p>
  //         Edit <code>src/App.jsx</code> and save to test HMR
  //       </p>
  //     </div>
  //     <p className="read-the-docs">
  //       Click on the Vite and React logos to learn more
  //     </p>
  //   </>
  // )
}

export default App
