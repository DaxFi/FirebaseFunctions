import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import sgMail from "@sendgrid/mail";
import { defineString } from "firebase-functions/params";

const sendGridApiKey = defineString("SEND_GRID_API_KEY");

admin.initializeApp();
sgMail.setApiKey(sendGridApiKey.value());

export const sendClaimEmail = functions.firestore
  .onDocumentCreated("pendingTransfers/{docId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }
    const data = snapshot.data();

    const email = data.email as string;
    const amount = data.amount as number;
    const message = data?.message as string;
    const senderName = data.senderName as string;

    const msg: sgMail.MailDataRequired = {
      to: email,
      from: "noreply@daxfi.xyz",
      subject: `You've received $${amount} on DaxFi!`,
      html: `
        <div style="max-width: 480px; margin: 0 auto; font-family: sans-serif; text-align: center; padding: 40px 20px; border-radius: 12px;">
          <img src="https://daxfi.xyz/logo-daxfi.png" alt="DaxFi Logo" style="max-width: 160px; margin-bottom: 24px;" />
          <h2 style="font-weight: 600; margin-bottom: 12px;">
            You've received $${amount}
          </h2>
          <p style="margin: 0 0 12px; font-size: 14px; color: #555;">
            from ${senderName} on ${new Date().toLocaleDateString()}
          </p>
          ${
            message
              ? `<p style="margin: 12px 0 24px; font-size: 14px;"><strong>Message:</strong> “${message}”</p>`
              : ""
          }
          <a href="https://daxfi.xyz/login" style="text-decoration: none;">
            <button style="background-color: #7E57C2; color: white; border: none; border-radius: 6px; padding: 14px 28px; font-size: 16px; cursor: pointer;">
              Join us on daxFi!
            </button>
          </a>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Email sent to ${email}`);
    } catch (error) {
      console.error("Error sending email:", error);
    }

    return null;
  });

export const sendRequestEmail = functions.firestore
  .onDocumentCreated("requests/{docId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }
    const data = snapshot.data();

    const recipientEmail = data.recipientEmail as string;
    const amount = data.amount as number;
    const message = data?.message as string;
    const requesterName = data.requesterName as string;

    const msg: sgMail.MailDataRequired = {
      to: recipientEmail,
      from: "noreply@daxfi.xyz",
      subject: `${requesterName} is requesting $${amount} on DaxFi`,
      html: `
        <div style="max-width: 480px; margin: 0 auto; font-family: sans-serif; text-align: center; padding: 40px 20px; border-radius: 12px;">
          <img src="https://daxfi.xyz/logo-daxfi.png" alt="DaxFi Logo" style="max-width: 160px; margin-bottom: 24px;" />
          <h2 style="font-weight: 600; margin-bottom: 12px;">
            ${requesterName} is requesting $${amount} from you
          </h2>
          ${
            message
              ? `<p style="margin: 12px 0 24px; font-size: 14px;"><strong>Message:</strong> “${message}”</p>`
              : ""
          }
          <a href="https://daxfi.xyz/confirm-transaction?recipient=${recipientEmail}&amount=${amount}&message=${message}" style="text-decoration: none;">
            <button style="background-color: #7E57C2; color: white; border: none; border-radius: 6px; padding: 14px 28px; font-size: 16px; cursor: pointer;">
              Pay with DaxFi!
            </button>
          </a>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Request email sent to ${recipientEmail}`);
    } catch (error) {
      console.error("Error sending request email:", error);
    }

    return null;
  });
