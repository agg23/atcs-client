import { ATCSAddress } from "../decoding/atcsPacket";

export interface ATCSMcpDef {
  address: ATCSAddress;
  name: string;
  milepost?: number;
  protocol: string;
  updated?: string;

  controlMessageType: string;
  controlBitLength: number;
  controlMnemonics: string[];

  indicationMessageType: string;
  indicationBitLength: number;
  indicationMnemonics: string[];

  other?: { [key: string]: string };
}
