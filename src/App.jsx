import { Viewer, Entity, PointGraphics, EntityDescription } from "resium";
import { Cartesian3 } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import StarShape from "./components/StarShape";
import MouseClick from "./components/MouseClick";
import MakeLine from "./components/MakeLine";
import MakePolygon from "./components/MakePolygon";
import MakePolyonColumn from "./components/MakePolyonColumn";
import ViewerComponent from "./components/ViewerComponent";
import { useState } from "react";
import Buttons from "./components/Buttons";
import { DefaultProvider } from "./context/DefaultContext";
// const position = Cartesian3.fromDegrees(127, 37.4, 100);

function App() {
  const [clickedPositions, setClickedPositions] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);


  const handleMovePolygon = () => {
    if (selectedPolygon) {
      // 모든 점을 (0, 0)으로 이동
      const movedPolygon = selectedPolygon.map(() => Cesium.Cartesian3.fromDegrees(0, 0, 0));
      setSelectedPolygon(movedPolygon);
    } else {
      console.log("No polygon to move.");
    }
  };

  const handleMake3D = () => {}
  const handleSaveDB = () => {}
  const handleRecallDB = () => {}
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
    </div>
  </DefaultProvider>
  );
}

export default App;