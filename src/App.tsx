import { useContext } from "react";
import "./App.css";
import Chart from "./Chart";
import { SwephContext } from "./SwephProvider";
import LoadingSpinner from "./LoadingSpinner";
import { FontsContext } from "./FontsProvider";
import { ConfigContext } from "./ConfigProvider";
import ChartForm from "./ChartForm";

function App() {
  const swe = useContext(SwephContext);
  const fontsOK = useContext(FontsContext);
  const cfg = useContext(ConfigContext);

  return (
    <>
      <ChartForm />
      {(swe && fontsOK && <Chart swe={swe} cfg={cfg.config} />) || (
        <LoadingSpinner />
      )}
    </>
  );
}

export default App;
