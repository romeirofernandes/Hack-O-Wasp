import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

// Initialize mermaid with dark theme and specific version settings
mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
  securityLevel: "loose",
  logLevel: "error",
  themeVariables: {
    background: "#1e1e1e",
    primaryColor: "#fff",
    primaryTextColor: "#fff",
    lineColor: "#fff",
  },
});

export default function MermaidRenderer({ chart }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (containerRef.current && chart) {
        try {
          // Enhanced cleaning of the mermaid code block syntax
          let cleanChart = chart
            .replace(/```mermaid\s*/g, "") // Remove ```mermaid with any whitespace
            .replace(/```\s*$/gm, "") // Remove closing ``` with whitespace
            .replace(/;(?=\s*(?:\n|$))/g, "") // Remove semicolons at line ends
            .trim();

          // Ensure the chart starts with a valid diagram type
          if (
            !cleanChart.match(
              /^(?:graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|flowchart|gantt|pie|journey)/
            )
          ) {
            throw new Error(
              "Invalid diagram type. Chart must start with a valid diagram declaration."
            );
          }

          const id = `mermaid-${Math.random().toString(36).substring(2)}`;

          // Parse the diagram first to validate syntax
          await mermaid.parse(cleanChart);

          // If parse succeeds, render the diagram
          const { svg } = await mermaid.render(id, cleanChart);
          containerRef.current.innerHTML = svg;
        } catch (error) {
          console.error("Mermaid render error:", error);
          containerRef.current.innerHTML = `
            <div class="text-red-400 p-4 bg-red-500/10 border border-red-500/20 rounded">
              <p class="font-medium mb-2">Failed to render diagram:</p>
              <p class="text-sm">${
                error.message || "Invalid diagram syntax"
              }</p>
              <p class="text-xs mt-2 text-red-400/70">Please check your diagram syntax and ensure it starts with a valid diagram type.</p>
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [chart]);

  return (
    <div
      ref={containerRef}
      className="mermaid-container overflow-x-auto bg-white/5 p-4 rounded-lg"
    />
  );
}
