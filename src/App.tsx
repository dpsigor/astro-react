import './App.css'
import Chart from './Chart'
import { Sweph } from './vos/sweph'

function App(props: { swh: Sweph }) {
  return (
    <>
      <h1>Vite + React</h1>
      <Chart swh={props.swh}/>
    </>
  )
}

export default App
