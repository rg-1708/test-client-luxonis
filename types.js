"use strict";
exports.__esModule = true;
exports.MessageType = void 0;
// Message types
var MessageType;
(function (MessageType) {
    MessageType[MessageType["INITIATION"] = 0] = "INITIATION";
    MessageType[MessageType["AUTH_REQUEST"] = 1] = "AUTH_REQUEST";
    MessageType[MessageType["AUTH_SUCCESS"] = 2] = "AUTH_SUCCESS";
    MessageType[MessageType["AUTH_FAILURE"] = 3] = "AUTH_FAILURE";
    MessageType[MessageType["MESSAGE"] = 4] = "MESSAGE";
    MessageType[MessageType["CLIENT_LIST_REQUEST"] = 5] = "CLIENT_LIST_REQUEST";
    MessageType[MessageType["CLIENT_LIST_RESPONSE"] = 6] = "CLIENT_LIST_RESPONSE";
    MessageType[MessageType["MATCH_REQUEST"] = 7] = "MATCH_REQUEST";
    MessageType[MessageType["MATCH_RESPONSE"] = 8] = "MATCH_RESPONSE";
    MessageType[MessageType["MATCH_CLIENT_ID"] = 9] = "MATCH_CLIENT_ID";
    MessageType[MessageType["MATCH_CLIENT_ID_RESPONSE"] = 10] = "MATCH_CLIENT_ID_RESPONSE";
    MessageType[MessageType["MATCH_CLIENT_ID_ERROR"] = 11] = "MATCH_CLIENT_ID_ERROR";
    MessageType[MessageType["MATCH_CLIENT_ID_NOTIFICATION"] = 12] = "MATCH_CLIENT_ID_NOTIFICATION";
    MessageType[MessageType["MATCH_HINT"] = 13] = "MATCH_HINT";
    MessageType[MessageType["MATCH_ATTEMPT"] = 14] = "MATCH_ATTEMPT";
    MessageType[MessageType["MATCH_ATTEMPT_WRONG"] = 15] = "MATCH_ATTEMPT_WRONG";
    MessageType[MessageType["MATCH_ATTEMPT_RIGHT"] = 16] = "MATCH_ATTEMPT_RIGHT";
    MessageType[MessageType["MATCH_GIVE_UP"] = 17] = "MATCH_GIVE_UP";
    MessageType[MessageType["MATCH_END_PREMATURE"] = 18] = "MATCH_END_PREMATURE";
    MessageType[MessageType["MATCH_END_GUESSED"] = 19] = "MATCH_END_GUESSED";
    MessageType[MessageType["RESET"] = 21] = "RESET";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
