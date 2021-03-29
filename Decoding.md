23 14 05 CF 8F 60 00 20 00 EA 2A A1 16 54 21 7A A1 42 1A A8 A2 A2 00 E0 02 02 12 8B 03 00 01 08 19 A1 68

# ATCSmon

Wayside MCP: 70014210080202

2021/03/27 09:31:22
???? Datagram (1) Inbound to Ground Network (35)
Frame=35 GFI=6 Group=0 SSeq=16 Rseq=0 Beacon=0 Vital=0 UsrData=5
To Dispatch: 2001165421
Number=9.2.11 CODELINE_INDICATION_MSG
Mnemonics=K15,K14,K11
03 00 01 08 19                                           .....

23: #
## Byte 0:
Value: 14

QDTTPPPA
Q: 0
D: 0
TT: 01
PPP: 010
A: 0

## Byte 1:
Value: 05
// Ignore

## Byte 2:
Value: CF
// Ignore

## Byte 3:
Value: 8F
// Ignor

## Byte 4:
Value: 60

SSSSDDDD

Source length: 6
Dest length: 0

## Byte 5:
Value: 00

## Byte 6:
Value: 20

## Byte 7:
Value: 00

Source address: 002000

## Byte 8:
Value: EA

## Byte 9:
Value: 2A

## Byte 10:
Value: A1

///////

# ATCSmon Reverse Engineering

Largly from AAR Manual of Standards and Recommended Practices Railway Electronics K-II, Appendix D, 2.0

## Byte 4:
Value: 60

GFI (General Format ID): 6
Logical Channel Group: 0

Assuming that is start of packet:

## Byte 1-3:
Value: 00 20 00
// Ignore

## Byte 4
Value: EA

Source length: E = 14
Dest length: A = 10

## Byte 5-10:
Value: 2A A1 16 54 21

Dest address: 2001165421
T.RRR.NN.DDDD
T (0: ground network node, 2: host computers): 2
RRR: 001
NN: 16
DDDD: 5421 (5000: dispatch, see manual of ATCS, Appendix T, 4.3)

## Byte 11-18:
Value: 7A A1 42 1A A8 A2 A2

Source address: 70014210080202
T.RRR.LLL.GGG.SS.DD
T (always 7 or 5): 7
RRR (railroad): 001
LLL (region/district): 421
GGG (control group in region): 008
SS (equipment in control group): 02
DD (internal within equipment): 02

## Byte 19:
Value: 00

Facility length (generally 0)

# Packet text start

## Byte 20
Value: E0

Upper 7 bits (message number/counter): 112
LSB (1 if multi-packet, 0 if single): 0

## Byte 21
Value: 02

Upper 7 bits (part number of multi-packet message, 1 indexed): 1
LSB (End-to-end ack bit/send response when received): 0

## Byte 22
Value: 02

Upper 7 bits (total message length of multi-packet message): 1
LSB (Vital bit. If 1, last four bytes contain CRC): 0

## Byte 23-24
Value: 12 8B

* CODELINE_CONTROL_MSG (9,0,1 - 0x1201)
* CODELINE_RECALL_MSG (9,1,8 – 0x1248)
* CODELINE_INDICATION_MSG (9,2,11 – 0x128B)

Type of message: CODELINE_INDICATION_MSG

## Byte 25-31       
Value: 03 00 01 08 19 A1 68

Packet data (from a higher layer?)
Version: 3
Timestamp: 0
Length: 1
Bits in last byte: 8
Data: 19 = 00011001