import messages from "./messages.json";

interface ATCSMessageBase {
  type: keyof typeof messages;
  specId: string;
  friendlyName: string;
}

export interface ATCSCodelineIndication extends ATCSMessageBase {
  type: "4747";

  /**
   * Should always be 3
   */
  revision: number;
  timestamp: number;
  length: number;
  lastByteBitCount: number;
  activeIndexes: number[];
}

export interface ATCSCodelineControl extends ATCSMessageBase {
  type: "4609";

  /**
   * Should always be 3
   */
  revision: number;
  address: number;
  timestamp: number;
  length: number;
  lastByteBitCount: number;
  activeIndexes: number[];
}

export type ATCSMessage = ATCSCodelineIndication | ATCSCodelineControl;
