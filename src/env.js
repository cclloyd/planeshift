"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dotEnv = void 0;
exports.dotEnv = {
    FOUNDRY_URL: process.env.FOUNDRY_URL,
    FOUNDRY_USER: process.env.FOUNDRY_USER,
    FOUNDRY_PASS: process.env.FOUNDRY_PASS,
    FOUNDRY_ADMIN_PASS: process.env.FOUNDRY_ADMIN_PASS,
    FOUNDRY_LOG_ENABLED: Boolean(process.env.FOUNDRY_LOG_ENABLED).valueOf(),
};
