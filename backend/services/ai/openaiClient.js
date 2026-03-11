// Sets up the OpenAI client — every AI call in the app goes through this.
const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

module.exports = client;
