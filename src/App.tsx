import { useContext } from "react";
import "./App.css";
import Chart from "./Chart";
import { SwephContext } from "./SwephProvider";
import LoadingSpinner from "./LoadingSpinner";
import { FontsContext } from "./FontsProvider";
import ChartForm from "./ChartForm";

function App() {
  const swe = useContext(SwephContext);
  const fontsOK = useContext(FontsContext);

  return (
    <>
      <ChartForm />
      {(swe && fontsOK && <Chart swe={swe} />) || <LoadingSpinner />}
    </>
  );
}

export default App;
