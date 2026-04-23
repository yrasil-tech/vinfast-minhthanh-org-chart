"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { OrgNode, DEPT_CONFIG, Department } from "@/lib/types";

// ── Public handle for parent to call ──
export interface OrgChartHandle {
  updateNode: (node: OrgNode) => void;
  addNode: (node: OrgNode) => void;
  removeNode: (id: string) => void;
  fit: () => void;
  expandAll: () => void;
  collapseAll: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

interface OrgChartProps {
  initialData: OrgNode[];
  isAuth: boolean;
  onNodeClick: (node: OrgNode) => void;
}

function toChartItem(n: OrgNode) {
  return { ...n, id: n.id, parentId: n.parent_id || undefined };
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
    <div data-node-id="${node.id}" style="
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
        : ""
      }
    </div>
  `;
}

const OrgChart = forwardRef<OrgChartHandle, OrgChartProps>(
  ({ initialData, isAuth, onNodeClick }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const isAuthRef = useRef(isAuth);
    const dataRef = useRef<OrgNode[]>(initialData);
    const onNodeClickRef = useRef(onNodeClick);

    isAuthRef.current = isAuth;
    dataRef.current = initialData;
    onNodeClickRef.current = onNodeClick;

    // ── Global edit handler (called from inline HTML) ──
    useEffect(() => {
      (window as any).__onNodeEdit = (nodeId: string) => {
        const node = dataRef.current.find((n) => n.id === nodeId);
        if (node) onNodeClickRef.current(node);
      };
      return () => { delete (window as any).__onNodeEdit; };
    }, []);

    // ── INIT chart once ──
    useEffect(() => {
      if (chartRef.current || !containerRef.current || initialData.length === 0) return;

      let cancelled = false;

      (async () => {
        const d3 = await import("d3");
        const { OrgChart: D3OrgChart } = await import("d3-org-chart");
        await import("d3-flextree");

        if (cancelled || !containerRef.current) return;

        const chart = new D3OrgChart()
          .container(containerRef.current as any)
          .data(initialData.map(toChartItem) as any)
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

        // Wire zoom buttons
        const zoomInBtn = document.getElementById("btn-zoom-in");
        const zoomOutBtn = document.getElementById("btn-zoom-out");
        if (zoomInBtn) zoomInBtn.onclick = () => chart.zoomIn();
        if (zoomOutBtn) zoomOutBtn.onclick = () => chart.zoomOut();

        setTimeout(() => chart.fit(), 300);
      })();

      return () => { cancelled = true; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData.length > 0]);

    // ── Imperative methods (no full re-render!) ──
    useImperativeHandle(ref, () => ({

      // UPDATE: swap DOM content only — zero tree rebuild
      updateNode(node: OrgNode) {
        const container = containerRef.current;
        if (!container) return;

        // Update data in chart's internal state
        const chart = chartRef.current;
        if (chart) {
          try {
            const state = chart.getChartState();
            // Update in flat data array
            const dataItem = state.data?.find((d: any) => d.id === node.id);
            if (dataItem) Object.assign(dataItem, toChartItem(node));
            // Update in hierarchy nodes
            const hierNode = state.allNodes?.find((n: any) => n.data.id === node.id);
            if (hierNode) Object.assign(hierNode.data, toChartItem(node));
          } catch {}
        }

        // Direct DOM swap — find the div[data-node-id] and replace its outerHTML
        const el = container.querySelector(`[data-node-id="${node.id}"]`);
        if (el) {
          const height = parseInt(el.closest("foreignObject")?.getAttribute("height") || "85");
          el.outerHTML = buildNodeContent(node, height, isAuthRef.current);
        }
      },

      // ADD: use chart API (preserves expand state)
      addNode(node: OrgNode) {
        const chart = chartRef.current;
        if (!chart) return;
        chart.addNode(toChartItem(node) as any);
      },

      // REMOVE: use chart API
      removeNode(id: string) {
        const chart = chartRef.current;
        if (!chart) return;
        chart.removeNode(id);
      },

      fit()         { chartRef.current?.fit(); },
      expandAll()   { chartRef.current?.expandAll()?.fit(); },
      collapseAll() { chartRef.current?.collapseAll()?.expandLevel(2)?.fit(); },
      zoomIn()      { chartRef.current?.zoomIn(); },
      zoomOut()     { chartRef.current?.zoomOut(); },
    }));

    return (
      <div
        ref={containerRef}
        className="flex-1 w-full"
        style={{ minHeight: "600px" }}
      />
    );
  }
);

OrgChart.displayName = "OrgChart";
export default OrgChart;
