import type { AppDispatch } from "@/app/providers/store/model/store";
import { useDispatch } from "react-redux";

export const useAppDispatch: () => AppDispatch = useDispatch