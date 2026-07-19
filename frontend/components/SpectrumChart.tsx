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
      ]}
      layout={{
        autosize: true,
        height: 420,
        margin: { l: 56, r: 16, t: 16, b: 48 },
        xaxis: { title: { text: "波長 (nm)" } },
        yaxis: { title: { text: "反射率 R" }, range: [0, 1] },
        showlegend: false,
      }}
      useResizeHandler
      style={{ width: "100%" }}
      config={{ displayModeBar: false, responsive: true }}
    />
  );
}
