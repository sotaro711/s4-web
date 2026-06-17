"use client";

import Plot from "@/components/Plot";
import type { SimulationResponse } from "@/lib/api/client";

export default function SpectrumChart({
  result,
}: {
  result: SimulationResponse;
}) {
  return (
    <Plot
      data={[
        {
          x: result.wavelengths,
          y: result.R,
          name: "R (反射)",
          type: "scatter",
          mode: "lines",
          line: { color: "#2563eb", width: 2 },
        },
        {
          x: result.wavelengths,
          y: result.T,
          name: "T (透過)",
          type: "scatter",
          mode: "lines",
          line: { color: "#dc2626", width: 2 },
        },
      ]}
      layout={{
        autosize: true,
        height: 420,
        margin: { l: 56, r: 16, t: 16, b: 48 },
        xaxis: { title: { text: "波長 (nm)" } },
        yaxis: { title: { text: "反射率 / 透過率" }, range: [0, 1] },
        legend: { orientation: "h", y: 1.12 },
      }}
      useResizeHandler
      style={{ width: "100%" }}
      config={{ displayModeBar: false, responsive: true }}
    />
  );
}
