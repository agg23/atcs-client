import { ATCSMessage } from "./messages";

export interface ATCSPacket<T extends ATCSMessage> {
  /**
   * Indicates whether this is an ack packet as result of message reception
   *
   * "Q" bit (7) of byte 0
   */
  isAck: boolean;

  /**
   * Indicates whether a signal should be sent back to the originator on receipt
   *
   * "D" bit (6) of byte 0
   */
  requiresAck: boolean;

  /**
   * Message priority. Lower value is higher priority, with 0 as the highest
   */
  messagePriority: number;

  /**
   * If true, disable ARQ (automatic repeat request), which would occur if the required ack is not received
   */
  disableARQ: boolean;

  /**
   * The sender address of the packet
   */
  source: ATCSAddress;

  /**
   * The destination address of the packet
   */
  destination: ATCSAddress;

  /**
   * Facility length, for additionally facility information. This is generally 0
   */
  facilityLength: number;

  /**
   * A mod 128 0-indexed counter for the messages from the source to the destination. This can be used
   * to associate multi-packet messages and drop duplicate packets
   */
  messageCounter: number;

  /**
   * If true, the receiver should send an end-to-end ack
   */
  endToEndAck: boolean;

  multiPacket:
    | {
        /**
         * Part of the message in a multi-packet message. **0 indexed** (spec is actually 1 indexed, but this is converted)
         */
        part: number;

        /**
         * Total length of the message in a multi-packet message
         */
        length: number;
      }
    | undefined;

  /**
   * The "vital" bit. If true, the last 4 bytes of the message contain a CRC
   */
  containsCRC: boolean;

  message: T;
}

export type ATCSAddress = {
  value: number;

  /**
   * Three digit railroad number
   */
  railroad: number;
} & (
  | {
      /**
       * Host computer node
       */
      type: "2";

      /**
       * Two digit network node ID
       */
      node: number;

      /**
       * Four digit addressed device ID
       *
       * These IDs are namespaced @see MSRP K-II, Appendix T, 4.2/3
       */
      device: number;
    }
  | {
      /**
       * Wayside MCP node
       */
      type: "5";

      /**
       * Two digit separator for a given MCP
       */
      extension: number;

      /**
       * Four digit internal ID
       */
      internal: number;
    }
  | {
      /**
       * Standard MCP node
       */
      type: "7";
      /**
       * Three digit district number, indicating a portion of the dispatch territory
       */
      district: number;

      /**
       * Three digit control number, indicating a control group for a portion of the district
       */
      control: number;

      /**
       * Two digit equipment ID within the control group
       */
      equipment: number;

      /**
       * Two digit internal ID within the equipment
       */
      internal: number;
    }
);
