"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GratingDTO, LayerDTO } from "@/lib/api/client";

const DEFAULT_GRATING: GratingDTO = { n: 2.0, k: 0, fillFactor: 0.5 };

type Props = {
  layers: LayerDTO[];
  onChange: (layers: LayerDTO[]) => void;
};

function num(e: React.ChangeEvent<HTMLInputElement>): number {
  return Number(e.target.value);
}

export function LayerEditor({ layers, onChange }: Props) {
  const update = (i: number, patch: Partial<LayerDTO>) =>
    onChange(layers.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const updateGrating = (i: number, patch: Partial<GratingDTO>) => {
    const g = { ...(layers[i].grating ?? DEFAULT_GRATING), ...patch };
    update(i, { grating: g });
  };

  const toggleGrating = (i: number, on: boolean) =>
    update(i, { grating: on ? { ...DEFAULT_GRATING } : null });

  const addLayer = () => {
    const inserted: LayerDTO = {
      name: `layer${layers.length}`,
      thicknessNm: 100,
      n: 1.5,
      k: 0,
      grating: null,
    };
    // 新しい層を基板（末尾）の直前に挿入する。
    const next = [...layers];
    next.splice(Math.max(1, next.length - 1), 0, inserted);
    onChange(next);
  };

  const removeLayer = (i: number) => {
    if (layers.length <= 2) return; // 入射側 + 基板の最低2層は維持
    onChange(layers.filter((_, idx) => idx !== i));
  };

  const roleOf = (i: number) =>
    i === 0 ? "入射側" : i === layers.length - 1 ? "基板" : `第${i}層`;

  return (
    <div className="grid gap-3">
      {layers.map((layer, i) => (
        <div key={i} className="rounded-lg border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">{roleOf(i)}</span>
            <button
              type="button"
              onClick={() => removeLayer(i)}
              disabled={layers.length <= 2}
              className="text-xs text-red-600 disabled:text-neutral-300"
            >
              削除
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="名前">
              <Input
                value={layer.name}
                onChange={(e) => update(i, { name: e.target.value })}
              />
            </Field>
            <Field label="厚さ (nm)">
              <Input
                type="number"
                value={layer.thicknessNm}
                onChange={(e) => update(i, { thicknessNm: num(e) })}
              />
            </Field>
            <Field label="屈折率 n">
              <Input
                type="number"
                step={0.01}
                value={layer.n}
                onChange={(e) => update(i, { n: num(e) })}
              />
            </Field>
            <Field label="消衰係数 k">
              <Input
                type="number"
                step={0.01}
                value={layer.k}
                onChange={(e) => update(i, { k: num(e) })}
              />
            </Field>
          </div>

          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={layer.grating != null}
              onChange={(e) => toggleGrating(i, e.target.checked)}
            />
            1D グレーティング
          </label>

          {layer.grating != null && (
            <div className="mt-2 grid grid-cols-3 gap-2 rounded-md bg-neutral-50 p-2">
              <Field label="格子 n">
                <Input
                  type="number"
                  step={0.01}
                  value={layer.grating.n}
                  onChange={(e) => updateGrating(i, { n: num(e) })}
                />
              </Field>
              <Field label="格子 k">
                <Input
                  type="number"
                  step={0.01}
                  value={layer.grating.k}
                  onChange={(e) => updateGrating(i, { k: num(e) })}
                />
              </Field>
              <Field label="fill factor">
                <Input
                  type="number"
                  step={0.05}
                  min={0}
                  max={1}
                  value={layer.grating.fillFactor}
                  onChange={(e) => updateGrating(i, { fillFactor: num(e) })}
                />
              </Field>
            </div>
          )}
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addLayer}>
        + 層を追加
      </Button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <Label className="text-xs text-neutral-500">{label}</Label>
      {children}
    </div>
  );
}
