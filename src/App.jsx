import { Viewer, Entity, PointGraphics, EntityDescription } from "resium";
import { Cartesian3, Ion } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import StarShape from "./components/example/StarShape";
import MouseClick from "./components/example/MouseClick";
import MakeLine from "./components/example/MakeLine";
import MakePolygon from "./components/example/MakePolygon";
import MakePolyonColumn from "./components/example/MakePolyonColumn";
import ViewerComponent from "./components/ViewerComponent";
import { useState } from "react";
import Buttons from "./components/Buttons";
import { DefaultProvider } from "./context/DefaultContext";
import MovePolygon from "./components/example/MovePolygon";
import Rotation from "./components/example/Rotation";
// const position = Cartesian3.fromDegrees(127, 37.4, 100);

import ThreeCompoenet from "./components/ThreeCompoenet";
import ThreeCesiumComponent from "./components/ThreeCesiumComponent";

Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyYTI4M2Q1NC0yZDY4LTQ3ODctYjYxNS1kZTg3ZjQxZTYwMjAiLCJpZCI6MjM2MDg2LCJpYXQiOjE3MjQyMjk2ODJ9.Nm5KyDADkROONx84HrbNrKFt0kJpA8y5rPwIow2EMbc";

function App() {
  const [clickedPositions, setClickedPositions] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);

  return (
    <DefaultProvider>
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100%'}} >
        <ViewerComponent 
          clickedPositions={clickedPositions} 
          setClickedPositions={setClickedPositions}
          selectedPolygon={selectedPolygon}
          setSelectedPolygon={setSelectedPolygon}
        />
        <Buttons clearPositions={setClickedPositions} clearPolygon={setSelectedPolygon}/>
        {/* <ThreeCompoenet></ThreeCompoenet> */}
        {/* <ThreeCesiumComponent/> */}
        
    </div>
  </DefaultProvider>
  );
}

export default App;