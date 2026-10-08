import { EventEmitter } from "node:events";
import { sendEmail } from "./send.email.js";
import { emailTemplates } from "./tamplates.email.js";
export const emailEvent = new EventEmitter();

emailEvent.on("sendEmail", async ({ recipients, subject, data }) => {
  try {
    await sendEmail({
      ...recipients,
      subject,
      html: emailTemplates[subject](data),
    });
  } catch (error) {
    console.log(error);
  }
});
