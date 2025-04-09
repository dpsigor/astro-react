import { useContext } from "react";
import { ConfigContext } from "./ConfigProvider";

function ChartForm() {
  const cfg = useContext(ConfigContext);

  const date = new Date(cfg.config.date);

  const updateBackgroundColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    cfg.setBackgroundColor(color);
  };

  const updateDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month, day] = e.target.value.split("-").map(Number);
    date.setFullYear(year);
    date.setMonth(month - 1);
    date.setDate(day);
    cfg.setDate(date);
  };

  const updateTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hour, minute] = e.target.value.split(":").map(Number);
    date.setHours(hour);
    date.setMinutes(minute);
    cfg.setDate(date);
  };

  const addTime = (seconds: number) => {
    const newDate = new Date(date.valueOf() + seconds * 1000);
    cfg.setDate(newDate);
  };

  return (
    <div className="chart-form">
      <div>
        <label>Background color</label>
        <input
          type="color"
          value={cfg.config.chartColors.background}
          onChange={(e) => updateBackgroundColor(e)}
        />
        <button onClick={() => cfg.resetDefaults()}>Reset defaults</button>
      </div>
      <div>
        <input
          type="date"
          value={date.toISOString().slice(0, 10)}
          onChange={(e) => updateDate(e)}
        />
        <input
          type="time"
          value={date.toTimeString().slice(0, 5)}
          onChange={(e) => updateTime(e)}
        />
        <button onClick={() => addTime(-60)}>-1min</button>
        <button onClick={() => addTime(60)}>+1min</button>
      </div>
      <div>
        <label>Lat</label>
        <input
          type="number"
          value={cfg.config.geolat}
          max={90}
          min={-90}
          onChange={(e) => cfg.setGeolat(Number(e.target.value))}
        />
        <label>Lon</label>
        <input
          type="number"
          value={cfg.config.geolon}
          max={180}
          min={-180}
          onChange={(e) => cfg.setGeolon(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

export default ChartForm;
