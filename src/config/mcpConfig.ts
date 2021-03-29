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
    ({ index: keyIndex }) => keyIndex === index
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
    controlMnemonics = "",
    indicationMessageNo,
    indicationBits,
    indicationMnemonics = "",
    updated,
    protocol = "ATCS",
    ...other
  } = map;

  if (
    !address ||
    !name ||
    !controlMessageNo ||
    !controlBits ||
    !indicationMessageNo ||
    !indicationBits
  ) {
    throw new Error(
      `MCP def is missing information. Available keys: ${keys
        .filter(({ index: keyIndex }) => keyIndex === index)
        .map(({ field }) => field)
        .join(", ")}, Present: ${JSON.stringify(map)}`
    );
  }

  const parsedControlBitLength = parseInt(controlBits, 10);
  let parsedControlMnemonics = controlMnemonics.split(",");

  if (parsedControlMnemonics.length < parsedControlBitLength) {
    parsedControlMnemonics = [
      ...Array(parsedControlBitLength - parsedControlMnemonics.length).fill(""),
      ...parsedControlMnemonics,
    ];
  }

  const parsedIndicationBitLength = parseInt(indicationBits, 10);
  let parsedIndicationMnemonics = indicationMnemonics.split(",");

  if (parsedIndicationMnemonics.length < parsedIndicationBitLength) {
    parsedIndicationMnemonics = [
      ...Array(
        parsedIndicationBitLength - parsedIndicationMnemonics.length
      ).fill(""),
      ...parsedIndicationMnemonics,
    ];
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
