import yaml from "js-yaml";

export type MatchConfig = {
  root: string;
  patterns: string[];
};

export type Configuration = {
  encrypted: boolean;
  matches: MatchConfig[];
};

export const loadConfig = (data: string) => {
  return yaml.load(data) as Record<string, Configuration>;
};
