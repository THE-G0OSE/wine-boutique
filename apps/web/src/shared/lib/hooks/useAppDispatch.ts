// Единственное разрешённое обращение shared → app: только типы (стираются при сборке)
import type { AppDispatch } from "@/app/providers/store/model/store";
import { useDispatch } from "react-redux";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
