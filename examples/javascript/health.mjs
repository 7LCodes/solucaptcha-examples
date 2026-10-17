import { SoluCaptchaClient } from "./client.mjs";
console.log(JSON.stringify(await new SoluCaptchaClient().health(), null, 2));
