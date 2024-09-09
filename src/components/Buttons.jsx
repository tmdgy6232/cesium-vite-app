import React, {useContext} from 'react';
import Button from './UI/Button';
import { DefaultContext } from '../context/DefaultContext';
const Buttons = ({ clearPositions, clearPolygon}) => {

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
        case 'moveCamera':
        activeButtons('moveCamera');
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
      <Button color={buttonsState.moveCamera ? 'primary' : 'default'} onClick={() => handleButtonClick('moveCamera')}>Move camera 0,0</Button>
      </div>
    </div>
  );
};

export default Buttons;
