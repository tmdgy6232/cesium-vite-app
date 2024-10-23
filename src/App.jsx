import { Viewer, Entity, PointGraphics, EntityDescription } from "resium";
import * as Cesium from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
import StarShape from "./components/example/StarShape";
import MouseClick from "./components/example/MouseClick";
import MakeLine from "./components/example/MakeLine";
import MakePolygon from "./components/example/MakePolygon";
import MakePolyonColumn from "./components/example/MakePolyonColumn";
import ViewerComponent from "./components/ViewerComponent";
import { useState, useReducer } from "react";
import Buttons from "./components/Buttons";
import { DefaultProvider } from "./context/DefaultContext";
import MovePolygon from "./components/example/MovePolygon";
import Rotation from "./components/example/Rotation";
// const position = Cartesian3.fromDegrees(127, 37.4, 100);

import ThreeCompoenet from "./components/ThreeCompoenet";
import ThreeCesiumComponent from "./components/ThreeCesiumComponent";

Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyYTI4M2Q1NC0yZDY4LTQ3ODctYjYxNS1kZTg3ZjQxZTYwMjAiLCJpZCI6MjM2MDg2LCJpYXQiOjE3MjQyMjk2ODJ9.Nm5KyDADkROONx84HrbNrKFt0kJpA8y5rPwIow2EMbc";

// 선 길이 체크 함수 관련 초기설정
const initialDistanceState = {
  lines: [],
  points: [],
}

// 선 길이 체크 관련 reducer 함수 정의
const distanceReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_POINT': {
      const updatedPoints = [...state.points, action.payload];
      // 두 번째 좌표를 클릭하면 선을 생성
      if (updatedPoints.length === 2) {
        const newLine = {
          start: updatedPoints[0],
          end: updatedPoints[1],
          length: Cesium.Cartesian3.distance(updatedPoints[0], updatedPoints[1]),
        };
        return {
          ...state,
          lines: [...state.lines, newLine],
          points: [], // 클릭된 포인트 초기화
        };
      }
      return { ...state, points: updatedPoints };
    }
    case 'CLEAR_ALL': {
      return { ...state, lines: [], points: [] }; // 모든 선과 좌표 초기화
    }
    default:
      return state;
  }
};


function App() {
  const [clickedPositions, setClickedPositions] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [distanceState, dispatch] = useReducer(distanceReducer, initialDistanceState);

  console.log(distanceState)
  const handleDistanceClearAll = () => {
    dispatch({ type: 'CLEAR_ALL' }); // 모든 선을 삭제하는 액션 발생
  };
  return (
    <DefaultProvider>
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', height:'100%'}} >
        <ViewerComponent 
          clickedPositions={clickedPositions} 
          setClickedPositions={setClickedPositions}
          selectedPolygon={selectedPolygon}
          setSelectedPolygon={setSelectedPolygon}
          distanceState={distanceState}
          dispatch={dispatch}
        />
        <Buttons clearPositions={setClickedPositions} clearPolygon={setSelectedPolygon} clearDistanceLines={handleDistanceClearAll}/>
        {/* <ThreeCompoenet></ThreeCompoenet> */}
        {/* <ThreeCesiumComponent/> */}
        
    </div>
  </DefaultProvider>
  );
}

export default App;