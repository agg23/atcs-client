export interface Config {
  url: string;
  location: {
    lat: number;
    long: number;
  };
  mcpConfigs: string[];
}
