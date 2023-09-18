import { useState } from 'react';
import './SettingsBar.css';

function SettingsBar(props) {

    const [color, setColor] = useState("white");

    function switchColor(){
        if(color === "white"){
            setColor("black");
            return "black";
        }
        setColor("white");
        return "white";
    }
    
    return (
        <div className="sidebar">
            <h3>Color:</h3>
            <label className='switch'>
                <input type="checkbox" onClick={() => props.changeColor(switchColor())}/>
                <span className = "slider" />
            </label>
        </div>
    )
}

export default SettingsBar