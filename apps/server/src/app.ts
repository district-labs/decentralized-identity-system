import express from "express";
import logger from "morgan";
import * as path from "path";
import {ethers} from "ethers";
import { errorHandler, errorNotFoundHandler } from "./middlewares/errorHandler";

// Routes
import { index } from "./routes/index";
// Create Express server
export const app = express();

const DID = {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
}
const signatureWallet = "0x3e2982801c1869c3925238b9a31a10382838df553297ebebad271ff43c680d5a5d09227b5b60866a38915216a71da95de59cb2fc5850e49d71a70ee4207ab9161b"
const signatureDID = "0x7a72d0cff717f5e6a5c482e86006228f754244ec88461e8b10dcaf3915acaeda40aa13dac7647a0506f7be06113b24d6f591e4b92b538b6b7947f0d0142da59a1c"

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
    const msg = ethers.utils.solidityPack(['bytes', 'bytes', 'bytes'], [signatureWallet, signatureDID, hexValue]);
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
