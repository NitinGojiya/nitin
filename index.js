require("dotenv").config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const app = express();

const PORT = 3000; // You can use any port

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));


const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

client.connect()
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));


// mongoose.connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => console.log("MongoDB Connected"))
//     .catch(err => console.error("MongoDB Connection Error:", err));
// Serve the HTML file

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
const projectSchema = new mongoose.Schema({
    name: String,
    description: String,
    tag: String,
    imageUrl: String,
    linkedin: String

});

const Project = mongoose.model("Project", projectSchema);
console.log("MONGO_URI outer:", process.env.MONGO_URI);
// 🔹 GET API - Fetch All Projects
app.get("/projects", async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        console.log("MONGO_URI:", process.env.MONGO_URI);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/send-mail', async (req, res) => {
    const { email, message, name, service, number } = req.body;

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
        host: 'smtp.your-email-provider.com',
        service: 'gmail', // e.g., Gmail, Outlook, etc.
        secure: true,
        port: 465,
        auth: {
            user: 'nitingojiya2000@gmail.com', // Your email
            pass: 'kcrt qvmd nkce evbd', // Your email password or app-specific password
        },
        tls: {
            rejectUnauthorized: false, // Ignore self-signed certificate errors
        },
    });

    const mailOptions = {
        from: "nitingojiya2000@gmail.com", // Sender's email
        to: 'nitingojiya2000@gmail.com', // Receiver's email
        subject: 'Contact From Portfolio Website', // Subject line
        text: message, // Plain text body
        html: '<p style="font-size:2rem;"><br/>Name:- ' + name + '<br/>Email:- ' + email + '<br/>Mobile Number:- ' + number + ' <br/>Service:-' + service + '<br/>Message:-' + message + '</p>',
    };

    // try {
    //     await transporter.sendMail(mailOptions);
    //     res.send('<h1>Email sent successfully!</h1>');
    // } catch (error) {
    //     console.error(error);
    //     res.send('<h1>Failed to send email. Try again later.</h1>'+error);
    // }
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
// Start the server
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
