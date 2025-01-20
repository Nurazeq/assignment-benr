import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);  // Add this line

const app = express();
const SECRET_KEY = '6LeiXr0qAAAAAFz8UjMt2cwY-C7hW1O_1TYb7EpG'; // Replace with your actual secret key

app.use(express.json());
app.use(cors());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Route to handle CAPTCHA verification
app.post('/verify-captcha', async (req, res) => {
    const captchaResponse = req.body.captchaResponse;

    const googleResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
        method: 'POST',
        body: new URLSearchParams({
            secret: SECRET_KEY,
            response: captchaResponse
        })
    });

    const verificationResult = await googleResponse.json();

    if (verificationResult.success) {
        res.json({ message: 'reCAPTCHA verified successfully!' });
    } else {
        res.status(400).json({ message: 'reCAPTCHA verification failed!' });
    }
});

app.listen(process.env.PORT || 80, () => {
    console.log('Server running on port 80');
});
