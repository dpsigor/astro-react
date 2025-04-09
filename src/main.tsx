import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SwephProvider } from "./SwephProvider.tsx";
import { FontsProvider } from "./FontsProvider.tsx";
import { ConfigProvider } from "./ConfigProvider.tsx";

async function main() {
  let rootPath = ".";
  if (import.meta.env.MODE === "development") {
    rootPath = "./astro-react";
  }

  createRoot(document.getElementById("root")!).render(
    <FontsProvider rootPath={rootPath}>
      <SwephProvider rootPath={rootPath}>
        <ConfigProvider>
          <App />
        </ConfigProvider>
      </SwephProvider>
    </FontsProvider>
  );
}

main();
