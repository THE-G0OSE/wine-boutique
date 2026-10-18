import { MotionConfig } from "motion/react";
import { StoreProvider } from "@/app/providers/store/ui/StoreProvider";
import { useApplyWineMode } from "@/entities/wineMode";
import { RouterProvider } from "../providers";

const WineModeAttribute = () => {
  useApplyWineMode();
  return null;
};

function App() {
  return (
    <StoreProvider>
      <MotionConfig reducedMotion="user">
        <WineModeAttribute />
        <RouterProvider />
      </MotionConfig>
    </StoreProvider>
  );
}

export default App;
