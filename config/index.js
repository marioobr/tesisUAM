require("dotenv").config();

const config = {
    dev: process.env.NODE_ENV !== "production",
    port: process.env.PORT || 5000,
    cors: process.env.CORS,
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    project_id: process.env.PROJECT_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/gm, '\n'),
    client_email: process.env.CLIENT_EMAIL
}

module.exports = { config };