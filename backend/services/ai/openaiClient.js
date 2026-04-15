// Sets up the OpenAI client — initialized lazily so a missing key doesn't crash the server at startup.
const OpenAI = require("openai");

let client = null;

function getClient() {
    if (!client) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY environment variable is not set.");
        }
        client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return client;
}

module.exports = getClient;
