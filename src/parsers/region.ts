export const regionStartMarker = '%% kanban:start %%';
export const regionStopMarker = '%% kanban:stop %%';

const startLine = /^[ \t]*%% kanban:start %%[ \t]*(\r?\n|$)/m;
const stopLine = /^[ \t]*%% kanban:stop %%[ \t]*$/m;
const frontmatterBlock = /^---\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/;

export interface KanbanRegion {
  before: string;
  inner: string;
  after: string;
}

export interface RegionFormat {
  headingDepth: number;
  laneSeparator: boolean;
  itemIndent: string | null;
  looseItems: boolean;
}

export function findKanbanRegion(md: string): KanbanRegion | null {
  const start = startLine.exec(md);
  if (!start) return null;

  const innerStart = start.index + start[0].length;
  const stop = stopLine.exec(md.slice(innerStart));
  if (!stop) return null;

  const innerEnd = innerStart + stop.index;

  return {
    before: md.slice(0, innerStart),
    inner: md.slice(innerStart, innerEnd),
    after: md.slice(innerEnd),
  };
}

export function getFrontmatterBlock(md: string): string | null {
  return md.match(frontmatterBlock)?.[0] ?? null;
}

export function detectRegionFormat(inner: string): RegionFormat {
  const heading = inner.match(/^(#{1,6})[ \t]/m);

  const continuation = inner.match(/^- \[.\] .*\r?\n([ \t]+)\S/m);

  return {
    headingDepth: heading ? heading[1].length : 2,
    laneSeparator: /^---[ \t]*$/m.test(inner),
    itemIndent: continuation ? continuation[1] : null,
    looseItems: /^(?:- \[.\] |[ \t]+\S).*\r?\n[ \t]*\r?\n- \[.\] /m.test(inner),
  };
}
