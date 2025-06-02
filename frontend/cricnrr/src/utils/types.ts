export interface ResponseData {
    status: boolean;
    message: string | string[];
    data: any;
}
export interface CalculateNRRData {
    myTeam: string;
    oppTeam: string;
    overs: number;
    desiredPosition: number;
    battingFirst: boolean;
    runs: number;
}
export interface PointsTableType {
  team: string;
  matches: number;
  won: number;
  lost: number;
  nrr: number;
  runsFor: number;
  oversFor: number;
  runsAgainst: number;
  oversAgainst: number;
  points: number;
}