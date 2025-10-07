import { type FC } from "react";
import { motion } from "motion/react";
import { useAppSelector } from "@/shared/lib/hooks/useAppSelector";
import { appSelection } from "@/shared/model/appSlice";
import { useProgressValues } from "../model/lib/hooks/useProgressValues";

interface IProps {
  progress: number;
}

const ProgressBar: FC<IProps> = ({ progress }) => {
  const { theme } = useAppSelector(appSelection);
  const {x, width} = useProgressValues(progress)

  return (
    <div className="relative bg-white rounded-full w-full h-3 overflow-hidden">
      <motion.div
        className={`${
          theme === "red" ? "bg-primary-200" : "bg-secondary-200"
        } rounded-full h-full`}
        style={{ x, width }}
      />
    </div>
  );
};

export default ProgressBar;
