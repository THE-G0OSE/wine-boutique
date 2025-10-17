import { useWindowSize } from "@/shared/lib/hooks/useWindowSize";
import { cardsMock } from "@/entities/heroPageScrollCards/model/cardsMock";
import { motion, MotionValue, useScroll, useTransform } from "motion/react";
import ScrollCard from "@/entities/heroPageScrollCards/ui/ScrollCard";
import { useEffect, useRef, useState } from "react";

const HomePageScrollHeroSection = () => {
  console.log("PARENT RENDER")
  const { height } = useWindowSize();
  const { scrollY } = useScroll()
  const isFixed: MotionValue<number> = useTransform(scrollY, [height, height + 1], [0, 1])
  const [positionClassName, setPositionClassName] = useState<string>('absolute')
  const lastPositionClassName = useRef<string>('absolute')

  useEffect(() => {
    const unsubscribe = isFixed.on('change', (value) =>{
      const newValue = value > .5 ? ' fixed top-0 ' : " absolute "
      if (newValue !== lastPositionClassName.current){
        lastPositionClassName.current = newValue
        setPositionClassName(newValue)
      }
    } )
    setPositionClassName(scrollY.get() > height ? "fixed top-0" : "absolute")
    lastPositionClassName.current = scrollY.get() > height ? "fixed top-0" : "absolute"
    return unsubscribe
  },[])

  return (
    <div className="relative h-[600vh]">
      <motion.div
        className={` ${positionClassName} bg-[url(/images/wooden-back.jpg)] bg-repeat shadow-top-sm w-screen overflow-hidden h-screen bg-size-[20rem] `}
      >
        {/*[ ]: add progress bar*/}
        {cardsMock.map((card) => (
          <ScrollCard key={card.image + "-scroll-card"} card={card} scroll={scrollY} />
        ))}
      </motion.div>
    </div>
  );
};

export default HomePageScrollHeroSection;
