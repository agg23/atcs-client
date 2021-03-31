import { ATCSAddress } from "../decoding/atcsPacket";

export interface ATCSMcpInterfaceDef {
  messageType: string;
  bitLength: number;
  mnemonics: string[];
}

export type ATCSMcpDef = {
  address: ATCSAddress;
  name: string;
  milepost?: number;
  protocol: string;
  updated?: string;

  interface:
    | {
        type: "control";
        control: ATCSMcpInterfaceDef;
      }
    | {
        type: "indication";
        indication: ATCSMcpInterfaceDef;
      }
    | {
        type: "both";
        control: ATCSMcpInterfaceDef;
        indication: ATCSMcpInterfaceDef;
      };

  other?: { [key: string]: string };
};
