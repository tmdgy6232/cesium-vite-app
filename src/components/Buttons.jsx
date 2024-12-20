import React, {useContext} from 'react';
import Button from './UI/Button';
import { DefaultContext } from '../context/DefaultContext';
const Buttons = ({ clearPositions, clearPolygon, clearDistanceLines}) => {

  const {buttonsState, activeButtons} = useContext(DefaultContext);
  // 요소 초기화
const entityClear = () => {
  clearPositions([]);
  clearPolygon(null);
}
  const handleButtonClick = (key) => {
    switch (key) {
      case 'toggle':
        if(buttonsState.toggle) entityClear();
        activeButtons('toggle');
        break;
      case 'showXYZ':
        activeButtons('showXYZ');
        break;
      case 'showIndex':
        activeButtons('showIndex');
        break;                                                                                                                                                                                                            
      case 'movePolygon':
        activeButtons('movePolygon');
        break;
      case 'saveDB':
        activeButtons('saveDB');
        break;
        
      case 'make3D':
        activeButtons('make3D');
        break;
      case 'recallDB':
        activeButtons('recallDB');
        break;
      case 'recallListDB':
        activeButtons('recallListDB');
      break;
      case 'moveCamera':
        activeButtons('moveCamera');
      break;
      case 'distance':
        if(buttonsState.distance) clearDistanceLines();
        activeButtons('distance');
      break;
      case 'gizmo':
        activeButtons('gizmo');
      break;
      case 'test':
        activeButtons('test');
      break;
      default:  
        return;   
    }
  }
  return (
    <div style={{}}>
      <div style={{display:'flex', justifyContent:'flex-start', flexDirection:'column', gap: '1rem'}}>
      <Button color={buttonsState.toggle ? 'primary' : 'default'}  onClick={() => handleButtonClick('toggle')}>Draw Start</Button>
      <Button color={buttonsState.showXYZ ? 'primary' : 'default'} onClick={() => handleButtonClick('showXYZ')}>Show Points of Star</Button>
      <Button color={buttonsState.showIndex ? 'primary' : 'default'} onClick={() => handleButtonClick('showIndex')}>Show index of Star</Button>
      <Button color={buttonsState.make3D ? 'primary' : 'default'} onClick={() => handleButtonClick('make3D')}>Make Star to 3D</Button>
      <Button color={buttonsState.saveDB ? 'primary' : 'default'} onClick={() => handleButtonClick('saveDB')}>Save to DB</Button>
      <Button color={buttonsState.movePolygon ? 'primary' : 'default'} onClick={() => handleButtonClick('movePolygon')}>Shift to 0,0</Button>
      <Button color={buttonsState.recallDB ? 'primary' : 'default'} onClick={() => handleButtonClick('recallDB')}>Recall Star from DB</Button>
      <Button color={buttonsState.recallListDB ? 'primary' : 'default'} onClick={() => handleButtonClick('recallListDB')}>RecallList Star from DB</Button>
      <Button color={buttonsState.moveCamera ? 'primary' : 'default'} onClick={() => handleButtonClick('moveCamera')}>Move camera 0,0</Button>
      <Button color={buttonsState.distance ? 'primary' : 'default'} onClick={() => handleButtonClick('distance')}>Check distance</Button>
      <Button color={buttonsState.gizmo ? 'primary' : 'default'} onClick={() => handleButtonClick('gizmo')}>Use Gizmo</Button>
      <Button color={buttonsState.test ? 'primary' : 'default'} onClick={() => handleButtonClick('test')}>test</Button>
      </div>
    </div>
  );
};

export default Buttons;
