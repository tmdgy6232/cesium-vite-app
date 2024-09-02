import React, { createContext, useState } from 'react';

// Context 생성
export const DefaultContext = createContext();

export const DefaultProvider = ({ children }) => {
  const defaultState = {
    toggle: false,
    showXYZ: false,
    showIndex: false,
    make3D: false,
    movePolygon: false,
    saveDB: false,
    recallDB: false,        
  }
  const [buttonsState, setButtonState] = useState(defaultState);

  const activeButtons = (key) => {
    setButtonState((prev) => ({
      ...defaultState, // 이전 상태를 유지하면서
      [key]:!prev[key], // 특정 버튼만 활성화
    }));
  };

  return (
    <DefaultContext.Provider value={{ buttonsState, activeButtons }}>
      {children}
    </DefaultContext.Provider>
  );
};
