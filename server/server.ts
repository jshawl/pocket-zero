require("dotenv").config();
import express from "express";
import { PocketClient, Params } from "./lib/pocket";
import cors from "cors";

const app = express();

const pocket = new PocketClient(
  process.env.POCKET_CONSUMER_KEY!,
  process.env.POCKET_REDIRECT_URI!
);

const token = (string: string) => string.replace(/Bearer\ /, "") ?? "";

app.use(cors());

app.get("/auth", async (req, res) => {
  res.send({ url: pocket.getAuthorizationURL(await pocket.getRequestToken()) });
});

app.get("/auth/callback", async (req, res) => {
  const accessToken = await pocket.getAccessToken(
    String(req.query.requestToken)
  );
  res.redirect(`${process.env.CLIENT_URL!}?accessToken=${accessToken}`);
});

app.get("/api/list", async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(403).end();
  }
  const accessToken = token(req.headers.authorization);

  res.send(await pocket.list(accessToken, req.query as Params));
});

app.listen(3000);
