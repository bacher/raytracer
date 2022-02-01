import {useRef, useState} from 'react';

export function useForceUpdate(): () => void {
  const valueRef = useRef(0);
  const [, setValue] = useState(valueRef.current);

  return () => {
    setValue(++valueRef.current);
  };
}
