import { HomePage } from "@/pages/home";
import { MainLayout } from "@/widgets/layouts";
import type { ReactNode } from "react";

export const routes: {path: string, element: ReactNode}[] = [
    {
        path: "/",
        element: <MainLayout><HomePage/></MainLayout>,
    },
    {
        path: "/store",
        element: <></>,
    },
    {
        path: "/news",
        element: <></>,
    },
    {
        path: "/reviews",
        element: <></>,
    }
]
