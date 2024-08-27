import { Viewer, Entity, PointGraphics, EntityDescription } from "resium";
import { Cartesian3 } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import StarShape from "./components/StarShape";
import MouseClick from "./components/MouseClick";
import MakeLine from "./components/MakeLine";
import MakePolygon from "./components/MakePolygon";
import MakePolyonColumn from "./components/MakePolyonColumn";

const position = Cartesian3.fromDegrees(127, 37.4, 100);

function App() {
  return (
    // <Viewer full>
    //   <Entity position={position} name="Tokyo">
    //     <PointGraphics pixelSize={10} />
    //     <EntityDescription>
    //       <h1>Hello, world.</h1>
    //       <p>JSX is available here!</p>
    //     </EntityDescription>
    //   </Entity>
    // </Viewer>
    <MouseClick/>
  );
}

export default App;