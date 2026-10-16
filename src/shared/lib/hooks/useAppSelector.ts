// Единственное разрешённое обращение shared → app: только типы (стираются при сборке)
import type { RootState } from "@/app/providers/store/model/store";
import { useSelector } from "react-redux";

export const useAppSelector = useSelector.withTypes<RootState>()
