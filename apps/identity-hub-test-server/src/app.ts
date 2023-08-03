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
let DID = {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: "did:dis:10:0x5FbDB2315678afecb367f032d93F642f64180aa3:0x8fd0798717a8002dCe8A4b615bDC87D474A43B79"
}
const signatureDID = "0x5417b5894023f8d3848359f60bbd8e732caba7b937d3b714d22163eea29f1d8c7c6218ab8595433e840aa4292f99e77215cd8e8fbb0b9101a2d4bec98674d46f1c"
const signatureWallet = "0xab856af405d43f66dc003d335cec2889a4dfeb46b8dd2b9d9d1d4159f61b1ab32f4d5bb5bd51f05c9d1011b26d53408206fc2c4cf8adacd0d186ed125c5f430e1c"

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");

app.use(logger("dev"));

app.use(express.static(path.join(__dirname, "../public")));
app.get("*", index);
app.post("*", index);
app.get('/counterfactual/*', (req, res) => {
    const bytes = ethers.utils.toUtf8Bytes(JSON.stringify(DID));
    const hexValue = ethers.utils.hexlify(bytes);
    const salt = "1";
    const msg = ethers.utils.solidityPack(['uint256', 'bytes', 'bytes', 'bytes'], [BigNumber.from(salt), signatureWallet, signatureDID, hexValue]);
    res.json({
        data: msg
    });
})

app.get('/materialized/*', (req, res) => {
    const bytes = ethers.utils.toUtf8Bytes(JSON.stringify(DID));
    const hexValue = ethers.utils.hexlify(bytes);
    const msg = ethers.utils.solidityPack(['bytes', 'bytes'], [signatureDID, hexValue]);
    res.json({
        data: msg
    });
})

app.use(errorNotFoundHandler);
app.use(errorHandler);
