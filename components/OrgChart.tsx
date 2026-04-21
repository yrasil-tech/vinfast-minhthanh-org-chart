"use client";

import { useRef, useEffect } from "react";
import { OrgNode, DEPT_CONFIG, Department } from "@/lib/types";

interface OrgChartProps {
  data: OrgNode[];
  isAuth: boolean;
  onNodeClick: (node: OrgNode) => void;
}

function toChartData(data: OrgNode[]) {
  return data.map((n) => ({
    ...n,
    id: n.id,
    parentId: n.parent_id || undefined,
  }));
}

function buildNodeContent(node: OrgNode, height: number, isAuth: boolean) {
  const dept = DEPT_CONFIG[(node.department as Department)] || DEPT_CONFIG.leadership;
  const lvl = node.level ?? 0;
  const hasName = node.name?.trim();
  const isTop = lvl <= 1;
  const isMid = lvl >= 2 && lvl <= 4;

  const posSize = isTop ? "font-size:14px;font-weight:700;" : isMid ? "font-size:12px;font-weight:700;" : "font-size:11px;font-weight:600;";
  const nameSize = isTop ? "font-size:12px;" : "font-size:11px;";
  const padY = isTop ? "14px" : isMid ? "10px" : "8px";

  const editBtn = isAuth
    ? `<div onclick="event.stopPropagation();window.__onNodeEdit('${node.id}')" style="position:absolute;top:6px;right:8px;font-size:12px;color:${dept.border};opacity:0.6;cursor:pointer;padding:2px 6px;border-radius:6px;background:${dept.border}15;z-index:10;" onmouseover="this.style.opacity='1';this.style.background='${dept.border}30'" onmouseout="this.style.opacity='0.6';this.style.background='${dept.border}15'">✎</div>`
    : "";

  return `
    <div style="
      font-family:'Inter',sans-serif;
      background:${dept.bg};
      border:2px solid ${dept.border};
      border-radius:14px;
      padding:${padY} 14px;
      height:${height}px;
      display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;
      box-shadow:0 2px 8px rgba(0,0,0,0.06);
      transition:all 0.2s ease;
      cursor:default;
      position:relative;overflow:hidden;
    "
    ondblclick="event.stopPropagation();${isAuth ? `window.__onNodeEdit('${node.id}')` : ''}"
    onmouseover="this.style.boxShadow='0 6px 20px rgba(0,0,0,0.12)';this.style.transform='translateY(-2px)'"
    onmouseout="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)';this.style.transform='translateY(0)'"
    >
      ${isTop ? `<div style="position:absolute;top:0;left:0;right:0;height:4px;background:${dept.border};border-radius:14px 14px 0 0;"></div>` : ""}
      ${editBtn}
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
    </div>
  `;
}

export default function OrgChart({ data, isAuth, onNodeClick }: OrgChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const isInitRef = useRef(false);
  const isAuthRef = useRef(isAuth);
  const dataRef = useRef(data);
  const onNodeClickRef = useRef(onNodeClick);

  // Keep refs in sync
  isAuthRef.current = isAuth;
  dataRef.current = data;
  onNodeClickRef.current = onNodeClick;

  // Global edit handler
  useEffect(() => {
    (window as any).__onNodeEdit = (nodeId: string) => {
      const node = dataRef.current.find((n) => n.id === nodeId);
      if (node) onNodeClickRef.current(node);
    };
    return () => { delete (window as any).__onNodeEdit; };
  }, []);

  // INIT chart once
  useEffect(() => {
    if (isInitRef.current || !containerRef.current || data.length === 0) return;

    let cancelled = false;

    (async () => {
      const d3 = await import("d3");
      const { OrgChart: D3OrgChart } = await import("d3-org-chart");
      await import("d3-flextree");

      if (cancelled || !containerRef.current) return;

      const chart = new D3OrgChart()
        .container(containerRef.current as any)
        .data(toChartData(data) as any)
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
        .nodeContent((d: any) => buildNodeContent(d.data as OrgNode, d.height, isAuthRef.current))
        .linkUpdate(function (this: any) {
          d3.select(this)
            .attr("stroke", "#CBD5E1")
            .attr("stroke-width", 1.5);
        })
        .initialExpandLevel(4)
        .render();

      chartRef.current = chart;
      (window as any).__orgChart = chart;
      isInitRef.current = true;

      // Wire zoom buttons
      const zoomIn = document.getElementById("btn-zoom-in");
      const zoomOut = document.getElementById("btn-zoom-out");
      if (zoomIn) zoomIn.onclick = () => chart.zoomIn();
      if (zoomOut) zoomOut.onclick = () => chart.zoomOut();

      setTimeout(() => chart.fit(), 300);
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length > 0]); // only run when data first becomes available

  // UPDATE data in existing chart (no re-create, preserves expand/zoom state)
  useEffect(() => {
    if (!chartRef.current || !isInitRef.current) return;

    chartRef.current
      .data(toChartData(data) as any)
      .render();

  }, [data, isAuth]);

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full"
      style={{ minHeight: "600px" }}
    />
  );
}
