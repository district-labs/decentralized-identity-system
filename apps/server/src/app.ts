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

const data = {
    hash: "0x20869dac10b76c99294215ca2d58bb98518a09ed759ae057ad32425f5231995f",
    signature: "0x7a72d0cff717f5e6a5c482e86006228f754244ec88461e8b10dcaf3915acaeda40aa13dac7647a0506f7be06113b24d6f591e4b92b538b6b7947f0d0142da59a1c"
}

// MESSAGE HASH
// 0x20869dac10b76c99294215ca2d58bb98518a09ed759ae057ad32425f5231995f
// MESSAGE SIGNATURE
// 0x795f4162647c97cadccc9db06760a1a04afcd83e5b520be9a939eccafcaa09b970176a7ad4515db482c8359bb1164077a8c35ac7265b292c6123c1c4a50906ab1c

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");

app.use(logger("dev"));

app.use(express.static(path.join(__dirname, "../public")));
app.get("*", index);
app.post("*", index);
app.post('/*', (req, res) => {
    const bytes = ethers.utils.toUtf8Bytes(JSON.stringify(DID));
    const hexValue = ethers.utils.hexlify(bytes);
    const msg = ethers.utils.solidityPack(['bytes32', 'bytes', 'bytes'], [data.hash, data.signature, hexValue]);
    res.json({
        data: msg
    });
})

app.use(errorNotFoundHandler);
app.use(errorHandler);
