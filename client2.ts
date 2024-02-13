import * as net from "net";
import * as readline from "readline";

import { decoder, encoder } from "./utils";
import { MessageType } from "./types";

// Create a TCP client socket
const PORT = 3000;
const client = new net.Socket();

// Interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
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
  console.log("Connected to server.");

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
        console.log(`Server says: ${payload.toString()}`);
        rl.question("Enter your desired action: ", (action) => {
          if (action.at(0) === "0") {
            sendMessage(client, MessageType.CLIENT_LIST_REQUEST, action);
          } else if (action.at(0) === "1") {
            //sendMessage(client, MessageType.MATCH_REQUEST, action);
          }
        });
        break;
      case MessageType.CLIENT_LIST_RESPONSE:
        console.log(`List of possible opponents:\n ${payload.toString()}`);
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

// Start reading user input for messages
// function startReadingUserInput() {
//   rl.question("Type your message: ", (message) => {
//     sendMessage(client, MessageType.MESSAGE, message);

//     startReadingUserInput();
//   });
// }

// Handle connection close
client.on("close", () => {
  console.log("Connection closed.");
});
