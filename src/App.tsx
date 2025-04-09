import { useContext, useState } from "react";
import "./App.css";
import Chart from "./Chart";
import { SwephContext } from "./SwephProvider";
import LoadingSpinner from "./LoadingSpinner";
import { FontsContext } from "./FontsProvider";
import ChartForm from "./ChartForm";

function App() {
  const swe = useContext(SwephContext);
  const fontsOK = useContext(FontsContext);
  const [chartErrored, setChartErrored] = useState(false);

  return (
    <>
      <ChartForm />
      {chartErrored && (<div>There was an error rendering the chart</div>)}
      {(swe && fontsOK && <Chart swe={swe} chartErrored={(v) => setChartErrored(v)} />) || <LoadingSpinner />}
    </>
  );
}

export default App;
