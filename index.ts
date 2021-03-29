import { createSocket } from "dgram";
import { get } from "http";
import fetch from "node-fetch";
import { Socket } from "net";
import { rejects } from "node:assert";
import * as fs from "fs";

const server = async () => {
  // const result = await fetch("http://atcs-bnsf.railfanaz.com:4895");
  const client = new Socket();

  const tcpConnection = new Promise<string>((resolve, reject) => {
    client.on("data", (response) => {
      console.log(`${response}`);
      resolve(`${response}`);
    });

    client.on("error", reject);
  });

  client.connect(4895, "atcs-bnsf.railfanaz.com");

  const port = parseInt(await tcpConnection, 10);

  console.log(`Connecting to port ${port}`);

  const server = createSocket("udp4");

  server.on("error", (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
  });

  let messageCount = 0;

  const fileDescriptor = fs.openSync("raw_data", "w+");

  const zeroBuffer = Buffer.alloc(50, 0);

  server.on("message", (msg, rinfo) => {
    console.log(`Received message: ${msg}`);
    // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

    fs.write(
      fileDescriptor,
      Buffer.concat([msg, zeroBuffer]),
      0,
      (error, bytes) => {
        if (error) {
          console.log(`FS error ${error}`);

          return;
        }

        console.log(`Wrote ${bytes} bytes`);
      }
    );

    messageCount += 1;
  });

  server.on("listening", () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
  });

  // server.bind(port);

  console.log("Sending to UDP port");

  // atcs-texas.railfanaz.com
  server.send("hello", port, "atcs-bnsf.railfanaz.com", (error, bytes) => {
    if (error) {
      console.log(`Sending error: ${error}`);

      return;
    }

    console.log(`Started UDP with ${bytes}`);
  });

  // const udp = new Socket();

  // udp.on("data", (response) => {
  //   console.log(`${response}`);
  // });

  // udp.on("error", (error) => {
  //   console.log(error);
  // });

  // udp.connect(port, "atcs-bnsf.railfanaz.com");

  // process.on("SIGINT", () => {
  //   console.log("Shutting down");
  //   // fs.close(fileDescriptor, () => {});
  //   server.close();

  //   setTimeout(() => process.exit, 1000);
  //   process.exit();
  // });

  process.stdin.resume();
};

// const server = dgram.createSocket("udp4");

// server.on("error", (err) => {
//   console.log(`server error:\n${err.stack}`);
//   server.close();
// });

// server.on("message", (msg, rinfo) => {
//   console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
// });

// server.on("listening", () => {
//   const address = server.address();
//   console.log(`server listening ${address.address}:${address.port}`);
// });

// server.bind(port);

server();
