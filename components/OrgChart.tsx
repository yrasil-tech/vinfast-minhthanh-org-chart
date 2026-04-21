"use client";

import { useRef, useEffect, useCallback } from "react";
import { OrgNode, DEPT_CONFIG, Department } from "@/lib/types";

interface OrgChartProps {
  data: OrgNode[];
  isAuth: boolean;
  onNodeClick: (node: OrgNode) => void;
}

export default function OrgChart({ data, isAuth, onNodeClick }: OrgChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  const renderChart = useCallback(async () => {
    if (!containerRef.current || data.length === 0) return;

    // Dynamic import (no SSR)
    const d3 = await import("d3");
    const { OrgChart: D3OrgChart } = await import("d3-org-chart");
    await import("d3-flextree");

    // Map data to d3-org-chart format
    const chartData = data.map((n) => ({
      id: n.id,
      parentId: n.parent_id || undefined,
      ...n,
    }));

    // Clear previous
    containerRef.current.innerHTML = "";

    const chart = new D3OrgChart()
      .container(containerRef.current as any)
      .data(chartData as any)
      .nodeWidth(() => 260)
      .nodeHeight((d: any) => {
        const lvl = d?.data?.level ?? 0;
        if (lvl <= 1) return 100;
        if (lvl <= 3) return 90;
        if (lvl <= 5) return 85;
        return 75;
      })
      .childrenMargin(() => 40)
      .compactMarginBetween(() => 25)
      .compactMarginPair(() => 50)
      .siblingsMargin(() => 25)
      .neighbourMargin(() => 30)
      .nodeContent((d: any) => {
        const node = d.data as OrgNode;
        const dept = DEPT_CONFIG[(node.department as Department)] || DEPT_CONFIG.leadership;
        const lvl = node.level ?? 0;
        const hasName = node.name?.trim();
        const isTop = lvl <= 1;
        const isMid = lvl >= 2 && lvl <= 4;

        const posSize = isTop ? "font-size:14px;font-weight:700;" : isMid ? "font-size:12px;font-weight:700;" : "font-size:11px;font-weight:600;";
        const nameSize = isTop ? "font-size:12px;" : "font-size:11px;";
        const padY = isTop ? "14px" : isMid ? "10px" : "8px";

        const editHint = isAuth
          ? `<div style="position:absolute;top:6px;right:8px;font-size:10px;color:${dept.border};opacity:0.5;">✎</div>`
          : "";

        return `
          <div style="
            font-family:'Inter',sans-serif;
            background:${dept.bg};
            border:2px solid ${dept.border};
            border-radius:14px;
            padding:${padY} 14px;
            height:${d.height}px;
            display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;
            box-shadow:0 2px 8px rgba(0,0,0,0.06);
            transition:all 0.2s ease;
            cursor:${isAuth ? "pointer" : "default"};
            position:relative;overflow:hidden;
          "
          onmouseover="this.style.boxShadow='0 6px 20px rgba(0,0,0,0.12)';this.style.transform='translateY(-2px)'"
          onmouseout="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)';this.style.transform='translateY(0)'"
          >
            ${isTop ? `<div style="position:absolute;top:0;left:0;right:0;height:4px;background:${dept.border};border-radius:14px 14px 0 0;"></div>` : ""}
            ${editHint}
            <div style="display:inline-block;background:${dept.border}22;color:${dept.text};font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;padding:2px 10px;border-radius:10px;margin-bottom:6px;">
              ${dept.label}
            </div>
            <div style="${posSize}color:${dept.text};line-height:1.3;margin-bottom:${hasName ? "4px" : "0"};">
              ${node.position}
            </div>
            ${hasName
              ? `<div style="${nameSize}color:#334155;font-weight:500;">${node.name}</div>`
              : `<div style="font-size:10px;color:#94a3b8;font-style:italic;">( Chưa bổ nhiệm )</div>`
            }
            ${d.data._directSubordinates > 0
              ? `<div style="position:absolute;bottom:4px;right:10px;font-size:9px;color:#94a3b8;">${d.data._directSubordinates} cấp dưới</div>`
              : ""
            }
          </div>
        `;
      })
      .linkUpdate(function (this: any, d: any) {
        d3.select(this)
          .attr("stroke", "#CBD5E1")
          .attr("stroke-width", 1.5);
      })
      .onNodeClick((d: any) => {
        if (!isAuth) return;
        const clickedNode = data.find((n) => n.id === d);
        if (clickedNode) onNodeClick(clickedNode);
      })
      .initialExpandLevel(4)
      .render();

    chartRef.current = chart;

    // Wire zoom buttons
    const zoomIn = document.getElementById("btn-zoom-in");
    const zoomOut = document.getElementById("btn-zoom-out");
    if (zoomIn) zoomIn.onclick = () => chart.zoomIn();
    if (zoomOut) zoomOut.onclick = () => chart.zoomOut();

    setTimeout(() => chart.fit(), 300);
  }, [data, isAuth, onNodeClick]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  // Expose chart methods
  useEffect(() => {
    (window as any).__orgChart = chartRef.current;
  });

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full"
      style={{ minHeight: "600px" }}
    />
  );
}
