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
  terminal: true,
});

const cli_input_prefix = "Enter your key: ";

const default_commands = [
  {
    key: "0",
    command: "Request a list of possible opponents",
  },
  {
    key: "1",
    command: "request a match",
  },
  {
    key: "exit",
    command: "exit",
  },
];
const match_request_commands = [
  {
    key: "clientId + word",
    command: "Requests a match with a client and a specified word",
  },
  {
    key: "exit",
    command: "exit",
  },
];

const display_cli_instructions = (type: MessageType) => {
  switch (type) {
    case MessageType.AUTH_SUCCESS:
    case MessageType.CLIENT_LIST_RESPONSE:
      console.table(default_commands);
      break;
    case MessageType.MATCH_RESPONSE:
      console.table(match_request_commands);
      break;
  }
};
const write_cli_prefix = () => {
  process.stdout.write(cli_input_prefix);
};

const display_cli_formatted_list = (payload: Buffer) => {
  let list = payload.toString().split(",");
  if (list.length === 0 || (list.length === 1 && list.at(0) === "")) {
    console.log(`Sorry, currently no opponents are online.\n`);
    return;
  }
  const formattedList = list.map((item) => {
    return {
      "Player id": item,
    };
  });
  console.log(`List of possible opponents:\n`);
  console.table(formattedList);
};

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
  // Recieving Data
  let currentMessageType: MessageType = MessageType.INITIATION;

  rl.on("line", (line) => {
    switch (currentMessageType) {
      case MessageType.AUTH_SUCCESS:
      case MessageType.CLIENT_LIST_RESPONSE:
        if (line === "0") {
          sendMessage(client, MessageType.CLIENT_LIST_REQUEST, line);
        } else if (line === "1") {
          sendMessage(client, MessageType.MATCH_REQUEST, line);
        } else if (line === "exit") {
          client.destroy();
        }
        break;
      case MessageType.MATCH_RESPONSE:
      case MessageType.MATCH_CLIENT_ID_ERROR:
        if (line === "exit") {
          sendMessage(client, 21, "asd");
          return;
        } else {
          sendMessage(client, MessageType.MATCH_CLIENT_ID, line);
        }
        break;
      case MessageType.MATCH_CLIENT_ID_NOTIFICATION:
      case MessageType.MATCH_ATTEMPT_WRONG:
        if (line === "exit") {
          sendMessage(client, 17, line);
        } else {
          sendMessage(client, MessageType.MATCH_ATTEMPT, line);
        }
        break;
      case MessageType.MATCH_CLIENT_ID_RESPONSE:
        sendMessage(client, MessageType.MATCH_HINT, line);
        break;
    }
  });

  client.on("data", async (data) => {
    const { type, payload } = decoder(data);
    switch (type) {
      case MessageType.INITIATION:
        currentMessageType = MessageType.INITIATION;
        console.log(`Server: ${payload.toString()}`);
        rl.question("Please enter your password: ", (password) => {
          sendMessage(client, MessageType.AUTH_REQUEST, password);
        });
        break;
      case MessageType.AUTH_SUCCESS:
        currentMessageType = MessageType.AUTH_SUCCESS;
        console.clear();
        console.log(`- Server: ${payload.toString()}`);
        display_cli_instructions(MessageType.AUTH_SUCCESS);
        write_cli_prefix();
        // RL
        break;
      case MessageType.AUTH_FAILURE:
        currentMessageType = MessageType.AUTH_FAILURE;
        console.clear();
        console.log(`Server: ${payload.toString()}`);
        rl.question("Please enter your password: ", (password) => {
          sendMessage(client, MessageType.AUTH_REQUEST, password);
        });
        break;
      case MessageType.CLIENT_LIST_RESPONSE:
        currentMessageType = MessageType.CLIENT_LIST_RESPONSE;
        console.clear();
        display_cli_formatted_list(payload);
        display_cli_instructions(MessageType.CLIENT_LIST_RESPONSE);
        write_cli_prefix();
        //rl
        break;
      case MessageType.MATCH_RESPONSE:
        currentMessageType = MessageType.MATCH_RESPONSE;
        console.clear();
        display_cli_instructions(MessageType.MATCH_RESPONSE);
        process.stdout.write(`${payload}: `);
        //rl
        break;
      case MessageType.MATCH_CLIENT_ID_ERROR:
        currentMessageType = MessageType.MATCH_CLIENT_ID_ERROR;
        console.clear();
        display_cli_instructions(MessageType.MATCH_RESPONSE);
        process.stdout.write(`There was an error, ${payload} : `);
        //RL
        break;
      case MessageType.MATCH_CLIENT_ID_NOTIFICATION:
        currentMessageType = MessageType.MATCH_CLIENT_ID_NOTIFICATION;
        console.clear();
        console.log(`Notification: ${payload}`);
        process.stdout.write(`Please enter your first attempt: `);
        //RL
        break;
      case MessageType.MATCH_ATTEMPT_WRONG:
        currentMessageType = MessageType.MATCH_ATTEMPT_WRONG;
        process.stdout.write(`Whoops, not right, try again: `);
        //RL
        break;
      case MessageType.MATCH_END_PREMATURE:
        console.log("Match ended prematurely, you can start a new one.\n");
        sendMessage(client, 21, "reset");
        break;
      case MessageType.MATCH_HINT:
        console.log(`\nYou've been given a hint: ${payload.toString()}\n`);
        break;
      case MessageType.MATCH_ATTEMPT_RIGHT:
        console.clear();
        console.log(
          "Congratulations, you've guessed the word, returning to menu in 2s!"
        );
        await waitOneSecond();
        sendMessage(client, 21, "reset");
        break;
      case MessageType.MATCH_CLIENT_ID_RESPONSE:
        currentMessageType = MessageType.MATCH_CLIENT_ID_RESPONSE;
        console.clear();
        display_cli_instructions(MessageType.MATCH_CLIENT_ID_RESPONSE);
        console.log(`Notification: ${payload}`);
        process.stdout.write("Enter your hint: ");
        //RL
        break;
      case 19:
        console.log(
          "Congratulations, your word has been guessed, returning to menu in 2s!"
        );
        await waitOneSecond();
        sendMessage(client, 21, "reset");
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
  rl.close();
  sendMessage(client, MessageType.MATCH_GIVE_UP, "giveup on disconnect");
  console.log("Connection closed.");
});

function waitOneSecond(): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}
