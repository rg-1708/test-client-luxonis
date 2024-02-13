import * as net from "net";
import * as readline from "readline";

import { decoder, encoder } from "./utils";
import { MessageType } from "./types";
import { logConnected } from "./logger";

// Create a TCP client socket
const PORT = 3000;
const client = new net.Socket();

// Interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

function sendMessage(
  socket: net.Socket,
  type: MessageType,
  message: string
): void {
  const payload = Buffer.from(message);
  const encodedMessage = encoder(type, payload);
  socket.write(encodedMessage);
}

client.connect(PORT, "localhost", () => {
  logConnected();
  // Recieving Data
  client.on("data", (data) => {
    const { type, payload } = decoder(data);
    switch (type) {
      case MessageType.INITIATION:
        console.log(`Server says: ${payload.toString()}`);
        rl.question("Please enter your password: ", (password) => {
          sendMessage(client, MessageType.AUTH_REQUEST, password);
        });
        break;
      case MessageType.AUTH_SUCCESS:
        console.clear();
        console.log(`Server says: ${payload.toString()}`);
        rl.on("line", (line) => {
          if (line === "0") {
            sendMessage(client, MessageType.CLIENT_LIST_REQUEST, line);
          } else if (line === "1") {
            sendMessage(client, MessageType.MATCH_REQUEST, line);
          }
        });
        break;
      case MessageType.CLIENT_LIST_RESPONSE:
        console.clear();
        let list = payload.toString().split(",");
        const formattedList = list.map((item) => {
          return {
            "Player id": item,
          };
        });
        console.log(`List of possible opponents:\n`);
        console.table(formattedList);
        break;
      case MessageType.MATCH_RESPONSE:
        console.clear();
        rl.question(`${payload}: `, (message) => {
          sendMessage(client, MessageType.MATCH_CLIENT_ID, message);
        });
        break;
      case MessageType.MATCH_CLIENT_ID_ERROR:
        console.clear();
        rl.question(`There was an error, ${payload} : `, (message) => {
          if (message === "exit") {
            console.clear();
            return;
          }
          sendMessage(client, MessageType.MATCH_CLIENT_ID, message);
        });
        break;
      case MessageType.MATCH_CLIENT_ID_NOTIFICATION:
        console.clear();
        console.log(`Notification: ${payload}`);
        rl.question(`Please enter your first attempt: `, (message) => {
          sendMessage(client, MessageType.MATCH_ATTEMPT, message);
        });
        break;
      case MessageType.MATCH_ATTEMPT_WRONG:
        rl.question(`Whoops, not right, try again: `, (message) => {
          sendMessage(client, MessageType.MATCH_ATTEMPT, message);
        });
        break;
      case MessageType.MATCH_HINT:
        console.log(`${payload.toString()}`);
        break;
      case MessageType.MATCH_ATTEMPT_RIGHT:
        console.clear();
        console.log("Congratulations, you've guessed the word!");
        break;
      case MessageType.MATCH_CLIENT_ID_RESPONSE:
        console.clear();
        console.log(`Notification: ${payload}`);
        rl.on("line", (line) => {
          sendMessage(client, MessageType.MATCH_HINT, line);
        });
        break;

      case MessageType.MESSAGE:
        console.log(`Server says: ${payload.toString()}`);
        break;
    }
  });

  // Handling Errors
  client.on("error", (err: Error) => {
    console.error("Socket error:", err);
  });
});

// Handle connection close
client.on("close", () => {
  console.log("Connection closed.");
});
