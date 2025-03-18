require("dotenv").config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: "https://nitingojiya.vercel.app" // Allow requests from your frontend
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// Project Schema and Model
const projectSchema = new mongoose.Schema({
    name: String,
    description: String,
    tag: String,
    imageUrl: String,
    linkedin: String
});

const Project = mongoose.model("Project", projectSchema);

// 🔹 GET API - Fetch All Projects
app.get("/projects", async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🔹 POST API - Send Email
app.post('/send-mail', async (req, res) => {
    const { email, message, name, service, number } = req.body;

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use Gmail
        auth: {
            user: process.env.EMAIL_USER, // Your email from environment variable
            pass: process.env.EMAIL_PASS, // Your email password or app-specific password
        },
        tls: {
            rejectUnauthorized: false, // Ignore self-signed certificate errors
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender's email
        to: process.env.EMAIL_USER, // Receiver's email
        subject: 'Contact From Portfolio Website', // Subject line
        html: `
            <p style="font-size:2rem;">
                <br/>Name: ${name}
                <br/>Email: ${email}
                <br/>Mobile Number: ${number}
                <br/>Service: ${service}
                <br/>Message: ${message}
            </p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <link href="css/bootstrap-icons.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css">
            </head>
            <body>
                <div class="container mt-5">
                    <div class="alert alert-success" role="alert">
                        Email sent successfully!
                    </div>
                    <div>
                        <a href='index.html'><i style='font-size:3rem;color:green;' class="bi bi-box-arrow-left me-5"></i></a>
                    </div>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <link href="css/bootstrap-icons.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css">
            </head>
            <body>
                <div class="container mt-5">
                    <div class="alert alert-danger" role="alert">
                        Failed to send email. Try again later.
                        <br>
                        Error: ${error.message}
                    </div>
                    <div>
                        <a href='index.html'><i style='font-size:3rem;color:red;' class="bi bi-box-arrow-left me-5"></i></a>
                    </div>
                </div>
            </body>
            </html>
        `);
    }
});

// Serve index.html for all other routes (frontend)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});