import { makeStore, type AppStore } from "@/app/providers/store/model/store";
import { useRef, type FC, type ReactNode } from "react";
import { Provider } from "react-redux";

interface IProps {
    children: ReactNode
}

export const StoreProvider: FC<IProps> = ({children}) => {
    const storeRef = useRef<AppStore>(null)
    if (!storeRef.current) {
        storeRef.current = makeStore()
    }

    return <Provider store={storeRef.current}>{children}</Provider>
}
