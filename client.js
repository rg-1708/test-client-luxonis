"use strict";
exports.__esModule = true;
var net = require("net");
var readline = require("readline");
var utils_1 = require("./utils");
var types_1 = require("./types");
// Create a TCP client socket
var PORT = 3000;
var client = new net.Socket();
// Interface for user input
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});
function sendMessage(socket, type, message) {
    var payload = Buffer.from(message);
    var encodedMessage = (0, utils_1.encoder)(type, payload);
    socket.write(encodedMessage);
}
client.connect(PORT, "localhost", function () {
    // Recieving Data
    client.on("data", function (data) {
        var _a = (0, utils_1.decoder)(data), type = _a.type, payload = _a.payload;
        switch (type) {
            case types_1.MessageType.INITIATION:
                console.log("Server: ".concat(payload.toString()));
                rl.question("Please enter your password: ", function (password) {
                    sendMessage(client, types_1.MessageType.AUTH_REQUEST, password);
                });
                break;
            case types_1.MessageType.AUTH_SUCCESS:
                console.clear();
                console.log("- Server: ".concat(payload.toString()));
                console.log("Enter 0 to display a list of possible opponents\nEnter 1, to request a match\nexit to exit");
                rl.on("line", function (line) {
                    if (line === "0") {
                        sendMessage(client, types_1.MessageType.CLIENT_LIST_REQUEST, line);
                    }
                    else if (line === "1") {
                        sendMessage(client, types_1.MessageType.MATCH_REQUEST, line);
                    }
                    else if (line === "exit") {
                        client.destroy();
                        return;
                    }
                });
                break;
            case types_1.MessageType.AUTH_FAILURE:
                console.log("Server: ".concat(payload.toString()));
                rl.question("Please enter your password: ", function (password) {
                    sendMessage(client, types_1.MessageType.AUTH_REQUEST, password);
                });
                break;
            case types_1.MessageType.CLIENT_LIST_RESPONSE:
                console.clear();
                var list = payload.toString().split(",");
                var formattedList = list.map(function (item) {
                    return {
                        "Player id": item
                    };
                });
                console.log("List of possible opponents:\n");
                console.table(formattedList);
                break;
            case types_1.MessageType.MATCH_RESPONSE:
                console.clear();
                rl.question("".concat(payload, ": "), function (message) {
                    if (message === "exit") {
                        sendMessage(client, types_1.MessageType.MATCH_GIVE_UP, message);
                    }
                    else {
                        sendMessage(client, types_1.MessageType.MATCH_CLIENT_ID, message);
                    }
                });
                break;
            case types_1.MessageType.MATCH_CLIENT_ID_ERROR:
                console.clear();
                rl.question("There was an error, ".concat(payload, " : "), function (message) {
                    if (message === "exit") {
                        sendMessage(client, types_1.MessageType.CLIENT_LIST_REQUEST, message);
                    }
                    else {
                        sendMessage(client, types_1.MessageType.MATCH_CLIENT_ID, message);
                    }
                });
                break;
            case types_1.MessageType.MATCH_CLIENT_ID_NOTIFICATION:
                console.log("Notification: ".concat(payload));
                rl.question("Please enter your first attempt: ", function (message) {
                    if (message === "exit") {
                        sendMessage(client, types_1.MessageType.MATCH_GIVE_UP, message);
                    }
                    else {
                        sendMessage(client, types_1.MessageType.MATCH_ATTEMPT, message);
                    }
                });
                break;
            case types_1.MessageType.MATCH_ATTEMPT_WRONG:
                rl.question("Whoops, not right, try again: ", function (message) {
                    if (message === "exit") {
                        sendMessage(client, types_1.MessageType.MATCH_GIVE_UP, message);
                    }
                    else {
                        sendMessage(client, types_1.MessageType.MATCH_ATTEMPT, message);
                    }
                });
                break;
            case types_1.MessageType.MATCH_END_PREMATURE:
                console.log("Match ended prematurely, you can start a new one.\n");
                break;
            case types_1.MessageType.MATCH_HINT:
                console.log("\nYou've been given a hint: ".concat(payload.toString(), "\n"));
                break;
            case types_1.MessageType.MATCH_ATTEMPT_RIGHT:
                console.clear();
                console.log("Congratulations, you've guessed the word!");
                break;
            case types_1.MessageType.MATCH_CLIENT_ID_RESPONSE:
                console.clear();
                console.log("Notification: ".concat(payload));
                rl.on("line", function (line) {
                    sendMessage(client, types_1.MessageType.MATCH_HINT, line);
                });
                break;
            case types_1.MessageType.MESSAGE:
                console.log("Server says: ".concat(payload.toString()));
                break;
        }
    });
    // Handling Errors
    client.on("error", function (err) {
        console.error("Socket error:", err);
    });
});
// Handle connection close
client.on("close", function () {
    rl.close();
    console.log("Connection closed.");
});
