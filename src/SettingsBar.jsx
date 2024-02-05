import { useState } from 'react';
import Dropdown from './Dropdown';
import './SettingsBar.css';

function SettingsBar(props) {

    const [color, setColor] = useState("white");
    const [currentEngine, setCurrentEngine] = useState("Stockfish");

    function switchColor(){
        if(color === "white"){
            setColor("black");
            return "black";
        }
        setColor("white");
        return "white";
    }

    /* settings to add:
    clock
    stockfish or my own engine
    */
    
    return (
        <div className="sidebar">
            <h3>Color:</h3>
            <label className='switch'>
                <input type="checkbox" onClick={() => props.changeColor(switchColor())}/>
                <span className = "slider" />
            </label>
            <button className="buttons" onClick={() => { props.start() } }>Start</button>
            <p className="engineDisplay">{currentEngine}</p>
            <Dropdown
                trigger={<button className="dropdownButton">Choose engine</button>}
                menu={[
                    <button onClick={() => { props.chooseEngine("stockfish"); setCurrentEngine("Stockfish"); }}>Stockfish</button>,
                    <button onClick={() => { props.chooseEngine("fishy"); setCurrentEngine("Fishy"); }}>SomethingFishy</button>,
                ]}
            />
        </div>
    )
}

export default SettingsBar