import { getBCDNumber, getSetBitPositions } from "../util/bit";
import { ATCSMessage } from "./messages";

import messages from "./messages.json";

export const decodeMessage = (input: Uint8Array): ATCSMessage => {
  const type = `${Buffer.from(input.slice(0, 2)).readUInt16BE(0)}`;

  if (!isKnownMessageType(type)) {
    throw new Error(`Unknown message type ${type}. Data ${input}`);
  }

  const { specId, friendlyName } = messages[type];

  const messageInfo = {
    specId,
    friendlyName,
  };

  switch (type) {
    case "4609": {
      // 9.0.1 CODELINE_CONTROL_MSG

      const revision = input[2];

      if (revision !== 3) {
        console.warn(`Unexpected revision ${revision} for message ${input}`);
      }

      const length = input[5]!;

      const dataBytes = input.slice(7, 7 + length);

      return {
        ...messageInfo,
        type: "4609",
        revision: revision as 3,
        address: input[3]!,
        timestamp: input[4]!,
        length,
        lastByteBitCount: input[6]!,
        activeIndexes: getSetBitPositions(dataBytes),
      };
    }
    case "4747": {
      // 9.2.11 CODELINE_INDICATION_MSG

      const revision = input[2];

      if (revision !== 3) {
        console.warn(`Unexpected revision ${revision} for message ${input}`);
      }

      const length = input[4]!;

      const dataBytes = input.slice(6, 6 + length);

      return {
        ...messageInfo,
        type: "4747",
        revision: revision as 3,
        timestamp: input[3]!,
        length,
        lastByteBitCount: input[5]!,
        activeIndexes: getSetBitPositions(dataBytes),
      };
    }
  }
};

const isKnownMessageType = (type: string): type is keyof typeof messages =>
  type in messages;
