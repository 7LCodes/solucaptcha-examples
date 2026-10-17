import { SoluCaptchaClient } from "./client.mjs";
console.log(
  `Available balance: USD ${(await SoluCaptchaClient.fromEnv().getBalance()).toFixed(5)}`,
);
