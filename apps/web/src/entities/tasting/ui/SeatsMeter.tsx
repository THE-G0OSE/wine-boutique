import type { FC } from "react";
import { cn } from "@/shared/lib/cn";

interface IProps {
  capacity: number;
  seatsLeft: number;
  className?: string;
}

/** Места за столом квадратиками: занятые — тёмные, свободные — янтарные */
const SeatsMeter: FC<IProps> = ({ capacity, seatsLeft, className }) => {
  const taken = capacity - seatsLeft;
  return (
    <span role="img" aria-label={`Занято ${taken} из ${capacity}`} className={cn("flex gap-1.25", className)}>
      {Array.from({ length: capacity }, (_, index) => (
        <span key={index} className={cn("size-3.5 rounded-sm", { "bg-cellar-700": index < taken, "bg-amber-350": index >= taken })} />
      ))}
    </span>
  );
};

export default SeatsMeter;
