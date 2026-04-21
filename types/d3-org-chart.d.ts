declare module "d3-org-chart" {
  export class OrgChart {
    container(el: any): this;
    data(data: any): this;
    nodeWidth(fn: (d: any) => number): this;
    nodeHeight(fn: (d: any) => number): this;
    childrenMargin(fn: (d: any) => number): this;
    compactMarginBetween(fn: (d: any) => number): this;
    compactMarginPair(fn: (d: any) => number): this;
    siblingsMargin(fn: (d: any) => number): this;
    neighbourMargin(fn: (a: any, b?: any) => number): this;
    nodeContent(fn: (d: any) => string): this;
    linkUpdate(fn: (this: any, d: any) => void): this;
    onNodeClick(fn: (d: any) => void): this;
    initialExpandLevel(level: number): this;
    render(): this;
    fit(): this;
    zoomIn(): this;
    zoomOut(): this;
    expandAll(): this;
    collapseAll(): this;
    expandLevel(level: number): this;
  }
}

declare module "d3-flextree";
