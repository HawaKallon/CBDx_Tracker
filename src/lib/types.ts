export type ProgramType = 'sheet' | 'external';

export type ProgramConfig = {
  slug: string;
  name: string;
  description?: string;
  type: ProgramType;
  sheetName?: string;
  externalUrl?: string;
  enabled?: boolean;
};

export type ProgramsRegistry = {
  programs: ProgramConfig[];
};

export type HubRow = {
  monthLabel: string;
  hub: string;
  male: number;
  female: number;
  total: number;
  description?: string;
  extras: Record<string, string | number>;
};

export type ProgramSummary = {
  totalMale: number;
  totalFemale: number;
  totalParticipants: number;
  hubCount: number;
  rowCount: number;
};

export type HubAggregate = {
  hub: string;
  male: number;
  female: number;
  total: number;
};

export type ProgramSheetData = {
  sheetName: string;
  rows: HubRow[];
  summary: ProgramSummary;
  byHub: HubAggregate[];
};

export type ParsedWorkbook = {
  sheets: Record<string, ProgramSheetData>;
  syncedAt: string;
  source: 'local' | 'graph';
};
