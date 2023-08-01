import express from "express";
import logger from "morgan";
import * as path from "path";
import {BigNumber, ethers} from "ethers";
import { errorHandler, errorNotFoundHandler } from "./middlewares/errorHandler";

// Routes
import { index } from "./routes/index";
// Create Express server
export const app = express();

  // DID Document Object
const DID_ID = "did:dis:10:0x5FbDB2315678afecb367f032d93F642f64180aa3:0xF50C7Ce266d8F43cAF73a3307636E36C23090A7d"
let DID = {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: DID_ID
}

const signatureDID = "0xcc4d5855df6fae9b26d8fbdb18b0e8ecdb50c4bd7e13459ba7ad7fd2b500400c1befc3395bd7f0f6c6bbd129d0903924d2ad2d0809f1b42c0412bb5ede051cf01c"
const signatureWallet = "0xab856af405d43f66dc003d335cec2889a4dfeb46b8dd2b9d9d1d4159f61b1ab32f4d5bb5bd51f05c9d1011b26d53408206fc2c4cf8adacd0d186ed125c5f430e1c"

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");

app.use(logger("dev"));

app.use(express.static(path.join(__dirname, "../public")));
app.get("*", index);
app.post("*", index);
app.post('/counterfactual/*', (req, res) => {
    const bytes = ethers.utils.toUtf8Bytes(JSON.stringify(DID));
    const hexValue = ethers.utils.hexlify(bytes);
    const salt = "1";
    const msg = ethers.utils.solidityPack(['uint256', 'bytes', 'bytes', 'bytes'], [BigNumber.from(salt), signatureWallet, signatureDID, hexValue]);
    res.json({
        data: msg
    });
})

app.post('/materialized/*', (req, res) => {
    const bytes = ethers.utils.toUtf8Bytes(JSON.stringify(DID));
    const hexValue = ethers.utils.hexlify(bytes);
    const msg = ethers.utils.solidityPack(['bytes', 'bytes'], [signatureDID, hexValue]);
    res.json({
        data: msg
    });
})

app.use(errorNotFoundHandler);
app.use(errorHandler);
