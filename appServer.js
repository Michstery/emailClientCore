const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const IMAP = require('imap');
const { v4: uuidv4 } = require("uuid");
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { simpleParser } = require('mailparser');
const port = 3000;
require('dotenv/config')
const { ReadableStream } = require('stream/web');
global.ReadableStream = global.ReadableStream || ReadableStream;
const swaggerUI = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");


// Initialize Elasticsearch client
// const esClient = new Client({ node: 'http://localhost:9200' });
const esClient = new Client({
    cloud: {
      id: process.env.CLOUD_ID, // Replace with your Elastic Cloud ID
    },
    auth: {
      username: process.env.CLOUD_USERNAME, // Replace with your Elasticsearch username
      password: process.env.CLOUD_PASSWORD  // Replace with your Elasticsearch password
    }
  });

// Middleware
app.use(express.json());

io.on('connection', (app) => {
    console.log('a user connected');
});

// ==========  ~SWAGGER DEPENDECIES~ ==============// 
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
  
  const notifyClient = (userId, event, data) => {
    io.to(userId).emit(event, data);
  };

const parseEmail = (buffer) => {
    // (Implement email parsing logic using 'mailparser' library)
    // Example:
    return simpleParser(buffer);
  };

app.post('/register', async (req, res) => {
//password refers to Application password not user password
  const { email, password, emailService } = req.body;
  console.log(req.body)
  const userId = uuidv4();

    if (emailService == 'gmail'){
        imapConfig = {
            host: 'imap.gmail.com',
            port: 993
        };
    }

    if (emailService == 'outlook'){
        imapConfig = {
            host: 'imap-mail.outlook.com',
            port: 993
        };
    }

  // IMAP connection and validation
  const imap = new IMAP({
    user: email,
    password: password,
    host: imapConfig.host,
    port: imapConfig.port,
    tlsOptions: { rejectUnauthorized: false },
    tls: true
  });
  if (!imap) return "Error Connecting To IMAP SERVER"
  console.log({imap})

  imap.once('ready', async () => {
    // Save user details to Elasticsearch
    await esClient.index({
      index: 'users',
      id: userId,
      body: { email }
    });
    res.status(201).json({ message: 'User registered', userId });
    imap.end();
  });

  imap.once('error', (err) => {
    res.status(500).json({ error: err.message });
  });

  imap.connect();
});

app.get('/emails', async (req, res) => {
    const { email, password, emailService, userId } = req.query;
    //password refers to Application password not user password
        if (emailService == 'gmail'){
            imapConfig = {
                host: 'imap.gmail.com',
                port: 993
            };
        }
    
        if (emailService == 'outlook'){
            imapConfig = {
                host: 'imap-mail.outlook.com',
                port: 993
            };
        }
        const imap = new IMAP({
          user: email,
          password: password,
          host: imapConfig.host,
          port: imapConfig.port,
          tlsOptions: { rejectUnauthorized: false },
          tls: true
        });
      
        imap.once('ready', () => {
          imap.openBox('INBOX', true, () => {
            imap.search(['ALL'], (err, results) => {
              if (err) throw err;
              const f = imap.fetch(results, { bodies: '' });

                // Initialize an array to collect email data
                const emails = [];

              f.on('message', (msg, seqno) => {
                let buffer = '';
                msg.on('body', (stream) => {
                  stream.on('data', (chunk) => {
                    buffer += chunk.toString('utf8');
                  });
                });
                msg.once('end', async () => {
                    // Parse email and index in Elasticsearch
                    const emailData = await parseEmail(buffer); // Assume parseEmail is a function to deserialize email
                    emails.push({
                        subject: emailData.subject,
                        from: emailData.from,
                        date: emailData.date,
                        body: emailData.body,
                        flags: emailData.flags
                      });
                  });
                });
        
                f.once('error', (err) => {
                  console.log('Fetch error: ' + err);
                });
        
                f.once('end', async () => {
                  console.log('Done fetching all messages!');

                    // Index all emails in Elasticsearch
                    res.status(201).json({ 
                        emails,
                        userId 
                    });
                    for (let email of emails) {
                        await esClient.index({
                            index: `emails-${userId}`,
                            body: email
                        });
                        notifyClient(userId, 'new-email', email);  // Notify client of new email
                    }

                  imap.end();
                });
              });
            });
        });
        
        imap.once('error', (err) => {
            console.log(err);
        });
        
          imap.connect();
}),

app.get('/user', async (req, res)=> {
    const {indexName, userId} = req.body
    try {
        const result = await esClient.get({
          index: indexName,
          id: userId
        });
        //console.log('Document:', result);
        res.status(201).json({ result });
      } catch (error) {
        console.error('Error getting document:', error);
        return 'Error getting document:', error
      }
})

app.get('/users', async (req, res)=> {
    const {indexName} = req.body
    try {
        const result = await esClient.search({
          index: indexName,
          body: {
            query: {
              match_all: {}
            }
          },
          // Adjust size as needed; the default is 10
          size: 1000 // For example, retrieve up to 1000 documents at a time
        });
        res.status(201).json({ results: result.hits.hits });
    
        //console.log('All documents:', result);
      } catch (error) {
        console.error('Error retrieving documents:', error);
      }
})


// Schedule this fetchEmails function periodically using setInterval or a more sophisticated job scheduler like node-cron
    
  


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  io.on('connection', (app) => {
    console.log('a user connected');
});
});
