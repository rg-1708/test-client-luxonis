"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var cli_input_prefix = "Enter your key: ";
var default_commands = [
    {
        key: "0",
        command: "Request a list of possible opponents"
    },
    {
        key: "1",
        command: "request a match"
    },
    {
        key: "exit",
        command: "exit"
    },
];
var match_request_commands = [
    {
        key: "clientId + word",
        command: "Requests a match with a client and a specified word"
    },
    {
        key: "exit",
        command: "exit"
    },
];
function display_cli_instructions(type) {
    switch (type) {
        case types_1.MessageType.AUTH_SUCCESS:
        case types_1.MessageType.CLIENT_LIST_RESPONSE:
            console.table(default_commands);
            break;
        case types_1.MessageType.MATCH_RESPONSE:
            console.table(match_request_commands);
            break;
    }
}
function write_cli_prefix() {
    process.stdout.write(cli_input_prefix);
}
function display_cli_formatted_list(payload) {
    var list = payload.toString().split(",");
    if (list.length === 0 || (list.length === 1 && list[0] === "")) {
        console.log("Sorry, currently no opponents are online.\n");
        return;
    }
    var formattedList = list.map(function (item) {
        return {
            "Player id": item
        };
    });
    console.log("List of possible opponents:\n");
    console.table(formattedList);
}
function sendMessage(socket, type, message) {
    var payload = Buffer.from(message);
    var encodedMessage = (0, utils_1.encoder)(type, payload);
    socket.write(encodedMessage);
}
client.connect(PORT, "localhost", function () {
    // Recieving Data
    var currentMessageType = types_1.MessageType.INITIATION;
    rl.on("line", function (line) {
        switch (currentMessageType) {
            case types_1.MessageType.AUTH_SUCCESS:
            case types_1.MessageType.CLIENT_LIST_RESPONSE:
                if (line === "0") {
                    sendMessage(client, types_1.MessageType.CLIENT_LIST_REQUEST, line);
                }
                else if (line === "1") {
                    sendMessage(client, types_1.MessageType.MATCH_REQUEST, line);
                }
                else if (line === "exit") {
                    client.destroy();
                }
                break;
            case types_1.MessageType.MATCH_RESPONSE:
            case types_1.MessageType.MATCH_CLIENT_ID_ERROR:
                if (line === "exit") {
                    sendMessage(client, 21, "asd");
                    return;
                }
                else {
                    sendMessage(client, types_1.MessageType.MATCH_CLIENT_ID, line);
                }
                break;
            case types_1.MessageType.MATCH_CLIENT_ID_NOTIFICATION:
            case types_1.MessageType.MATCH_ATTEMPT_WRONG:
                if (line === "exit") {
                    sendMessage(client, 17, line);
                }
                else {
                    sendMessage(client, types_1.MessageType.MATCH_ATTEMPT, line);
                }
                break;
            case types_1.MessageType.MATCH_CLIENT_ID_RESPONSE:
                sendMessage(client, types_1.MessageType.MATCH_HINT, line);
                break;
        }
    });
    client.on("data", function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, type, payload, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = (0, utils_1.decoder)(data), type = _a.type, payload = _a.payload;
                    _b = type;
                    switch (_b) {
                        case types_1.MessageType.INITIATION: return [3 /*break*/, 1];
                        case types_1.MessageType.AUTH_SUCCESS: return [3 /*break*/, 2];
                        case types_1.MessageType.AUTH_FAILURE: return [3 /*break*/, 3];
                        case types_1.MessageType.CLIENT_LIST_RESPONSE: return [3 /*break*/, 4];
                        case types_1.MessageType.MATCH_RESPONSE: return [3 /*break*/, 5];
                        case types_1.MessageType.MATCH_CLIENT_ID_ERROR: return [3 /*break*/, 6];
                        case types_1.MessageType.MATCH_CLIENT_ID_NOTIFICATION: return [3 /*break*/, 7];
                        case types_1.MessageType.MATCH_ATTEMPT_WRONG: return [3 /*break*/, 8];
                        case types_1.MessageType.MATCH_END_PREMATURE: return [3 /*break*/, 9];
                        case types_1.MessageType.MATCH_HINT: return [3 /*break*/, 10];
                        case types_1.MessageType.MATCH_ATTEMPT_RIGHT: return [3 /*break*/, 11];
                        case types_1.MessageType.MATCH_CLIENT_ID_RESPONSE: return [3 /*break*/, 13];
                        case 19: return [3 /*break*/, 14];
                        case types_1.MessageType.MESSAGE: return [3 /*break*/, 16];
                    }
                    return [3 /*break*/, 17];
                case 1:
                    currentMessageType = types_1.MessageType.INITIATION;
                    console.log("Server: ".concat(payload.toString()));
                    rl.question("Please enter your password: ", function (password) {
                        sendMessage(client, types_1.MessageType.AUTH_REQUEST, password);
                    });
                    return [3 /*break*/, 17];
                case 2:
                    currentMessageType = types_1.MessageType.AUTH_SUCCESS;
                    console.clear();
                    console.log("- Server: ".concat(payload.toString()));
                    display_cli_instructions(types_1.MessageType.AUTH_SUCCESS);
                    write_cli_prefix();
                    // RL
                    return [3 /*break*/, 17];
                case 3:
                    currentMessageType = types_1.MessageType.AUTH_FAILURE;
                    console.clear();
                    console.log("Server: ".concat(payload.toString()));
                    rl.question("Please enter your password: ", function (password) {
                        sendMessage(client, types_1.MessageType.AUTH_REQUEST, password);
                    });
                    return [3 /*break*/, 17];
                case 4:
                    currentMessageType = types_1.MessageType.CLIENT_LIST_RESPONSE;
                    console.clear();
                    display_cli_formatted_list(payload);
                    display_cli_instructions(types_1.MessageType.CLIENT_LIST_RESPONSE);
                    write_cli_prefix();
                    //rl
                    return [3 /*break*/, 17];
                case 5:
                    currentMessageType = types_1.MessageType.MATCH_RESPONSE;
                    console.clear();
                    display_cli_instructions(types_1.MessageType.MATCH_RESPONSE);
                    process.stdout.write("".concat(payload, ": "));
                    //rl
                    return [3 /*break*/, 17];
                case 6:
                    currentMessageType = types_1.MessageType.MATCH_CLIENT_ID_ERROR;
                    console.clear();
                    display_cli_instructions(types_1.MessageType.MATCH_RESPONSE);
                    process.stdout.write("There was an error, ".concat(payload, " : "));
                    //RL
                    return [3 /*break*/, 17];
                case 7:
                    currentMessageType = types_1.MessageType.MATCH_CLIENT_ID_NOTIFICATION;
                    console.clear();
                    console.log("Notification: ".concat(payload));
                    process.stdout.write("Please enter your first attempt: ");
                    //RL
                    return [3 /*break*/, 17];
                case 8:
                    currentMessageType = types_1.MessageType.MATCH_ATTEMPT_WRONG;
                    process.stdout.write("Whoops, not right, try again: ");
                    //RL
                    return [3 /*break*/, 17];
                case 9:
                    console.log("Match ended prematurely, you can start a new one.\n");
                    sendMessage(client, 21, "reset");
                    return [3 /*break*/, 17];
                case 10:
                    console.log("\nYou've been given a hint: ".concat(payload.toString(), "\n"));
                    return [3 /*break*/, 17];
                case 11:
                    console.clear();
                    console.log("Congratulations, you've guessed the word, returning to menu in 2s!");
                    return [4 /*yield*/, waitOneSecond()];
                case 12:
                    _c.sent();
                    sendMessage(client, 21, "reset");
                    return [3 /*break*/, 17];
                case 13:
                    currentMessageType = types_1.MessageType.MATCH_CLIENT_ID_RESPONSE;
                    console.clear();
                    display_cli_instructions(types_1.MessageType.MATCH_CLIENT_ID_RESPONSE);
                    console.log("Notification: ".concat(payload));
                    process.stdout.write("Enter your hint: ");
                    //RL
                    return [3 /*break*/, 17];
                case 14:
                    console.log("Congratulations, your word has been guessed, returning to menu in 2s!");
                    return [4 /*yield*/, waitOneSecond()];
                case 15:
                    _c.sent();
                    sendMessage(client, 21, "reset");
                    return [3 /*break*/, 17];
                case 16:
                    console.log("Server says: ".concat(payload.toString()));
                    return [3 /*break*/, 17];
                case 17: return [2 /*return*/];
            }
        });
    }); });
    // Handling Errors
    client.on("error", function (err) {
        console.error("Socket error:", err);
    });
});
// Handle connection close
client.on("close", function () {
    rl.close();
    sendMessage(client, types_1.MessageType.MATCH_GIVE_UP, "giveup on disconnect");
    console.log("Connection closed.");
});
function waitOneSecond() {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, 1000);
    });
}
