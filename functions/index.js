const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const uuidv5 = require("uuid/v5");

// initialize express and cors for routing
const app = express();
app.use(cors());

// initialize firebase admin for realtime database
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   response.send("Hello from Firebase!");
// });

app.post("/", (req, res) => {
  const user = req.body;

  return admin
    .database()
    .ref("/users")
    .push(user)
    .then(() => {
      return res.status(200).send(user);
    })
    .catch(error => {
      console.error(error);
      return res.status(500).send("Oh no! Error: " + error);
    });
});

app.get("/", (req, res) => {
  return admin
    .database()
    .ref("/users")
    .on(
      "value",
      snapshot => {
        return res.status(200).send(snapshot.val());
      },
      error => {
        console.error(error);
        return res.status(500).send("Oh no! Error: " + error);
      }
    );
});

exports.users = functions.https.onRequest(app);

exports.onUserCreate = functions.database
  .ref("/users/{userId}")
  .onCreate((snapshot, context) => {
    const userId = context.params.userId;
    console.log(`New user ${userId}`);

    const userData = snapshot.val();
    const APP_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";
    const newId = uuidv5(Date.now().toString(), APP_NAMESPACE);
    return snapshot.ref.update({ userid: newId });
  });
