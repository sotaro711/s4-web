"use client";

// plotly.js-dist-min を使った軽量な Plotly コンポーネント。
// （react-plotly.js のデフォルトは巨大な plotly.js を読み込むため factory を使う）
import Plotly from "plotly.js-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";

const Plot = createPlotlyComponent(Plotly);
export default Plot;
