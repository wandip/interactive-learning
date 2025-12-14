import React, { useMemo } from 'react';
import { Mafs, Coordinates, Plot, Theme, useMovablePoint } from 'mafs';
import { compile } from 'mathjs';
import "mafs/core.css";
// import "mafs/font.css"; // reliable font loading usually requires adding to index.html or proper setup, skipping for now to rely on system fonts or app fonts

const COLORS = [Theme.red, Theme.blue, Theme.green, Theme.orange, Theme.purple, Theme.pink];

const GraphInteractive = ({ data }) => {
    const { equations, graph_title, graph_description, x_label, y_label } = data;

    const functions = useMemo(() => {
        if (!equations || !Array.isArray(equations)) return [];

        return equations.map((eq, index) => {
            // Robust parsing: remove "y=" or "f(x)=" if present
            // We assume the backend returns things like "y = x^2" or just "x^2"
            const expr = eq.replace(/^[a-zA-Z]+\s*\([^)]*\)\s*=\s*/, '').replace(/^[a-zA-Z]+\s*=\s*/, '');

            try {
                const compiled = compile(expr);
                return {
                    fn: (x) => {
                        try {
                            return compiled.evaluate({ x });
                        } catch (e) {
                            return NaN;
                        }
                    },
                    label: eq,
                    color: COLORS[index % COLORS.length],
                    error: null
                };
            } catch (e) {
                console.error("Failed to compile equation:", eq, e);
                return { error: e.message, label: eq };
            }
        });
    }, [equations]);

    return (
        <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-900">{graph_title || "Interactive Graph"}</h3>
                {graph_description && (
                    <p className="text-sm text-gray-500 mt-1">{graph_description}</p>
                )}
            </div>

            <div className="flex-1 min-h-[400px] relative">
                <Mafs
                    height={400}
                    viewBox={{ x: [-5, 5], y: [-5, 5] }}
                    preserveAspectRatio={false}
                >
                    <Coordinates.Cartesian
                        subdivisions={2}
                        xAxis={{ labels: (n) => n }}
                        yAxis={{ labels: (n) => n }}
                    />
                    {functions.map((f, i) => (
                        !f.error && (
                            <Plot.OfX
                                key={i}
                                y={f.fn}
                                color={f.color}
                                weight={3}
                            />
                        )
                    ))}
                </Mafs>
            </div>

            {/* Legend */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
                {functions.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: f.color || 'gray' }}></div>
                        <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-700">
                            {f.label}
                        </code>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GraphInteractive;
