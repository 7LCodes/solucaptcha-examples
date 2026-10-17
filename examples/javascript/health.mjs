import { SoluCaptchaClient } from "./client.mjs";
const { status, capacity, supportedTaskTypes } =
  await new SoluCaptchaClient().health();
console.log(JSON.stringify({ status, capacity, supportedTaskTypes }, null, 2));
