import "@/styles/index.less";

import { SharedProvider } from "./stores/ShareContext";
import Home from "./views/Home";

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route
            path="/"
            element={
              <SharedProvider>
                <Home />
              </SharedProvider>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
