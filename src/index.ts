/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import sgMail from "@sendgrid/mail";
import {defineString} from "firebase-functions/params";

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
    const senderName = data.senderName as string;

    const msg: sgMail.MailDataRequired = {
      to: email,
      from: "luiz@brickbonds.ca", // TODO: noreply@daxfi.xyz // must be verified in SendGrid
      subject: `You've received $${amount} on DaxFi!`,
      html: `
        <h2>Hi! You received $${amount} from ${senderName}</h2>
        <p>Click below to claim your funds and activate your wallet:</p>
        <a href="https://daxfi.xyz/claim?email=${encodeURIComponent(email)}">
          <button style="background:#007aff;color:#fff;padding:10px 20px;border:none;border-radius:4px;">Claim My Money</button>
        </a>
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
