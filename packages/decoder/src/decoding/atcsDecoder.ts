import { ATCSAddress, ATCSPacket } from "./atcsPacket";
import {
  extractBits,
  getBCDNumber,
  getNibbleBCDNumber,
  testBit,
} from "../util/bit";
import { decodeMessage } from "./messageDecoder";
import { ATCSMessage } from "./messages";
import { ATCSMcpDef } from "../config/mcp";

export const atcsDecode = (
  input: Uint8Array,
  mcps: Record<string, ATCSMcpDef>
): ATCSPacket<ATCSMessage> => {
  // Ignore first 4 bytes and last 2 (TODO: not sure why)
  const firstValue = input[0]!;

  const isAck = testBit(firstValue, 7);
  const requiresAck = testBit(firstValue, 6);
  const messagePriority = extractBits(firstValue, 1, 3);
  const disableARQ = testBit(firstValue, 0);

  // Ignore next 3 bytes
  const addressLengths = input[4]!;
  const sourceLength = (addressLengths >> 4) & 0xf;
  const destinationLength = addressLengths & 0xf;

  const desinationEnd = 5 + Math.ceil(destinationLength / 2);
  const sourceEnd = desinationEnd + Math.ceil(sourceLength / 2);

  const destination = buildAddress(input.slice(5, desinationEnd));
  const source = buildAddress(input.slice(desinationEnd, sourceEnd));

  const facilityLength = input[sourceEnd];

  if (facilityLength !== 0) {
    throw new Error(`Unexpected facility length ${facilityLength}`);
  }

  const index = sourceEnd + 1;

  const messageCounter = extractBits(input[index]!, 1, 7);
  const isMultiPacket = testBit(input[index]!, 0);

  const messagePart = extractBits(input[index + 1]!, 1, 7);
  const endToEndAck = testBit(input[index + 1]!, 0);

  const messageLength = extractBits(input[index + 2]!, 1, 7);
  const containsCRC = testBit(input[index + 2]!, 0);

  const mcpSource = mcps[`${source.value}`];

  const message = decodeMessage(input.slice(index + 3), mcpSource);

  const packet: ATCSPacket<ATCSMessage> = {
    isAck,
    requiresAck,
    messagePriority,
    disableARQ,
    source,
    destination,
    facilityLength,
    messageCounter,
    endToEndAck,
    multiPacket: undefined,
    containsCRC,
    message,
  };

  if (isMultiPacket) {
    packet.multiPacket = {
      part: messagePart - 1,
      length: messageLength,
    };
  }

  return packet;
};

export const buildAddress = (input: Uint8Array): ATCSAddress => {
  const type = (input[0]! >> 4) & 0xf;

  switch (type) {
    case 2:
      return buildHostComputer2Address(input);
    case 5:
      return buildMCP5Address(input);
    case 7:
      return buildMCP7Address(input);
    default: {
      throw new Error(
        `Unknown address type ${type}, address ${getNibbleBCDNumber(input)}`
      );
    }
  }
};

const buildHostComputer2Address = (input: Uint8Array): ATCSAddress => {
  const value = getNibbleBCDNumber(input);
  const railroad = getBCDNumber(input.slice(1, 4));
  const node = getBCDNumber(input.slice(4, 6));
  const device = getBCDNumber(input.slice(6, 10));

  return {
    type: "2",
    value,
    railroad,
    node,
    device,
  };
};

const buildMCP5Address = (input: Uint8Array): ATCSAddress => {
  const value = getNibbleBCDNumber(input);
  const railroad = getBCDNumber(input.slice(1, 4));
  const extension = getBCDNumber(input.slice(4, 6));
  const internal = getBCDNumber(input.slice(6, 10));

  return {
    type: "5",
    value,
    railroad,
    extension,
    internal,
  };
};

const buildMCP7Address = (input: Uint8Array): ATCSAddress => {
  const value = getNibbleBCDNumber(input);
  const railroad = getBCDNumber(input.slice(1, 4));
  const district = getBCDNumber(input.slice(4, 7));
  const control = getBCDNumber(input.slice(7, 10));
  const equipment = getBCDNumber(input.slice(10, 12));
  const internal = getBCDNumber(input.slice(12, 14));

  return {
    type: "7",
    value,
    railroad,
    district,
    control,
    equipment,
    internal,
  };
};
