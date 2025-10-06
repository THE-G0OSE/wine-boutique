import { StoreProvider } from "@/app/providers/store/ui/StoreProvider";
import { RouterProvider } from "../providers";

function App() {
  return (
    <StoreProvider>
      <RouterProvider />
    </StoreProvider>
  );
}

export default App;
