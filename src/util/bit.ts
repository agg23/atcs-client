/**
 * Tests a bit at the provided index
 */
export const testBit = (byte: number, index: number): boolean =>
  (byte & (1 << index)) != 0;

/**
 * Extracts `length` bits starting from position `index`
 */
export const extractBits = (byte: number, index: number, length: number) => {
  const mask = Math.pow(2, length) - 1;

  return (byte >> index) & mask;
};

export const getBCDNumber = (input: Uint8Array): number => {
  let acc = 0;

  for (let i = 0; i < input.length; i++) {
    acc += Math.pow(10, i) * input[input.length - 1 - i]!;
  }

  return acc;
};

export const getNibbleBCDNumber = (input: Uint8Array): number => {
  let acc = 0;

  for (let i = 0; i < input.length; i++) {
    const high = (input[input.length - 1 - i]! >> 4) & 0xf;
    const low = input[input.length - 1 - i]! & 0xf;

    if (low < 10) {
      acc += Math.pow(10, i * 2) * low;
    }
    if (high < 10) {
      acc += Math.pow(10, i * 2 + 1) * high;
    }
  }

  return acc;
};

export const toNibbleBCDNumber = (input: number): Uint8Array => {
  const acc: number[] = [];

  let minSize = 0;
  let index = 0;

  while (input > minSize) {
    acc.push(nthDigit(input, index));

    index += 1;
    minSize = Math.pow(10, index);
  }

  const nibbleBCD: number[] = [];

  for (let i = 0; i < acc.length; i += 2) {
    const low = acc[i]!;
    const high = acc[i + 1]!;

    const byte = (high << 4) | low;

    nibbleBCD.push(byte);
  }

  nibbleBCD.reverse();

  return new Uint8Array(nibbleBCD);
};

const nthDigit = (input: number, index: number): number =>
  Math.floor((input / Math.pow(10, index)) % 10);

export const getSetBitPositions = (input: Uint8Array): number[] => {
  const acc: number[] = [];

  for (let i = 0; i < input.length; i++) {
    const byte = input[i]!;
    for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
      if (testBit(byte, bitIndex)) {
        acc.push(i * 8 + bitIndex);
      }
    }
  }

  return acc;
};
