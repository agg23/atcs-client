import messages from "./messages.json";

interface ATCSMessageBase {
  type: keyof typeof messages;
  specId: string;
  friendlyName: string;
}

type ATCSMnemonics =
  | {
      type: "unknown";
      activeIndexes: number[];
    }
  | {
      type: "mcp";
      mnemonics: string[];
      activeIndexes: number[];
    };

export interface ATCSCodelineIndication extends ATCSMessageBase {
  type: "4747";

  /**
   * Should always be 3
   */
  revision: number;
  timestamp: number;
  length: number;
  lastByteBitCount: number;
  mnemonics: ATCSMnemonics;
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
  mnemonics: ATCSMnemonics;
}

export type ATCSMessage = ATCSCodelineIndication | ATCSCodelineControl;
