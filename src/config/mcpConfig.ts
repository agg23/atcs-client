import { parse } from "ini";
import { readFileSync } from "fs";
import { ATCSMcpDef } from "./mcp";
import { lowercaseFirst } from "../util/string";
import { buildAddress } from "../decoding/atcsDecoder";
import { toNibbleBCDNumber } from "../util/bit";

const mcpRegex = /^MCP([a-z]+)([0-9]+)$/i;

export const parseMCPIni = (path: string) => {
  const file = readFileSync(path, "utf-8");

  const parsedFile = parse(file);

  const mcpInfo: Record<string, string> = parsedFile["MCPInformation"];

  if (!mcpInfo) {
    throw new Error('No "MCPInformation" section in INI');
  }

  const availableKeys = Object.keys(mcpInfo)
    .map((key) => {
      const result = mcpRegex.exec(key);

      if (!result) {
        return null;
      }

      const [, field, index] = result;

      if (!field || index === undefined) {
        throw new Error(`Could not extract key from ${key}`);
      }

      return {
        field,
        index: parseInt(index, 10),
      };
    })
    .filter((m) => !!m) as Array<{
    field: string;
    index: number;
  }>;

  const availableIndexes = new Set<number>();
  for (const { index } of availableKeys) {
    availableIndexes.add(index);
  }

  const mcps: Record<string, ATCSMcpDef> = {};

  availableIndexes.forEach((index) => {
    try {
      const mcp = parseMCPEntry(mcpInfo, availableKeys, index);

      mcps[`${mcp.address.value}`] = mcp;
    } catch (e) {
      console.error(`Could not parse MCP entry ${index}. ${e}`);
    }
  });

  return mcps;
};

const parseMCPEntry = (
  mcpInfo: Record<string, string>,
  availableKeys: Array<{
    field: string;
    index: number;
  }>,
  index: number
): ATCSMcpDef => {
  const keys = availableKeys.filter(
    ({ index: keyIndex }) => keyIndex - 1 === index
  );

  const map: Record<string, string> = {};

  for (const { field, index: keyIndex } of keys) {
    const value = mcpInfo[`MCP${field}${keyIndex}`] as string;

    map[lowercaseFirst(field)] = value;
  }

  const {
    address,
    name,
    milepost,
    controlMessageNo,
    controlBits,
    controlMnemonics,
    indicationMessageNo,
    indicationBits,
    indicationMnemonics,
    updated,
    protocol,
    ...other
  } = map;

  if (
    !address ||
    !name ||
    !controlMessageNo ||
    !controlBits ||
    !controlMnemonics ||
    !indicationMessageNo ||
    !indicationBits ||
    !indicationMnemonics ||
    !protocol
  ) {
    throw new Error(
      `MCP def is missing information. Available keys: ${keys
        .filter(({ index: keyIndex }) => keyIndex - 1 === index)
        .map(({ field }) => field)}`
    );
  }

  const parsedControlBitLength = parseInt(controlBits, 10);
  const parsedControlMnemonics = controlMnemonics.split(",");

  if (parsedControlMnemonics.length !== parsedControlBitLength) {
    throw new Error(
      `Mismatched config control lengths, ${parsedControlBitLength} vs ${parsedControlMnemonics.length}`
    );
  }

  const parsedIndicationBitLength = parseInt(indicationBits, 10);
  const parsedIndicationMnemonics = indicationMnemonics.split(",");

  if (parsedIndicationMnemonics.length !== parsedIndicationBitLength) {
    throw new Error(
      `Mismatched config indication lengths, ${parsedIndicationBitLength} vs ${parsedIndicationMnemonics.length}`
    );
  }

  return {
    address: buildAddress(toNibbleBCDNumber(parseInt(address, 10))),
    protocol,
    name,
    milepost: milepost ? parseFloat(milepost) : undefined,
    controlMessageType: controlMessageNo,
    controlBitLength: parsedControlBitLength,
    controlMnemonics: parsedControlMnemonics,
    indicationMessageType: indicationMessageNo,
    indicationBitLength: parsedIndicationBitLength,
    indicationMnemonics: parsedIndicationMnemonics,
    updated,
    other,
  };
};
