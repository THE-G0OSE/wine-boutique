import type { MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";


/**
 * Function that recieves motionValue and some settings and returns state that will be updated only if it recieve NEW value. That helps to avoid useless rerenders
 * 
 * 
 * 
 * @param mValue MotionValue that you want to subscribe
 * @param callback callback that defined how you will get your state from MotionValue
 * @param initialValue initialValue of your state
 * @param throttleDelay  minimal delay between your state changes
 */

export const useMotionChange = <MotionT, StateT>(
  mValue: MotionValue<MotionT>,
  callback: (value: MotionT) => StateT,
  initialValue: StateT,
  throttleDelay: number
) => {
  const [state, setState] = useState<StateT>(initialValue);
  const lastState = useRef<StateT>(initialValue);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = mValue.on("change", (value) => {
      if (timeout) return;
      timeout = setTimeout(() => {
        const newState = callback(value);
        if (newState !== lastState.current) {
          lastState.current = newState;
          setState(newState)
        }
        timeout = null
      }, throttleDelay);
    });

    return () => {
        unsubscribe();
        if (timeout) clearTimeout(timeout)
    }
  }, [callback, throttleDelay, mValue]);

  return state
};
