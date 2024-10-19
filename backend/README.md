## Document Collaboration Discord Bot

### Note to Turing Reviewers

Due to the extensive setup involved with MongoDB Atlas and Discord Developer Portal, I will privately message you on Discord with the contents of my .env to streamline the process on your end. However, without whitelisting your IP address on my Atlas dashboard, the app will not run based on my MONGO_URI. Substituting the connection with any MongoDB database should suffice, but the Discord variables otherwise save time. My apologies for the README being nauseatingly detailed, but the project description includes instant fail and severe reduction clauses and I decided to over-insure on instructions to be safe.

The project retrospective can be accessed [here](https://docs.google.com/document/d/13SRN3UaJSyBtItIcNe6iaKeSSTb41s8rUS3vSjNXlpc/edit?usp=sharing).

### Overview

The aim of this application is to integrate a document management system directly into Discord by interfacing with a built-in Discord bot. It presents an accessible alternative to existing collaborative software solutions that is decoupled from external providers (see: Google Docs, OnlyOffice), feature-slim, and completely free. It serves a market at reduced scale, enabling collaborative document management for smaller scale teams, hobbyists, gamers, etc. Interfacing with the Discord bot allows users to seamlessly collaborate within their Discord environment without ever having to log in to a third party service.

### Key Technologies

**TypeScript:** Ensures type safety, improves code readability and maintainability.  
 **Nest.js:** Progressive Node.js framework for building efficient and scalable server-side applications.  
 **Discord.js:** Robust library for interacting with the Discord API and creating Discord bots.  
 **MongoDB Atlas:** Cloud-based MongoDB service for storing and managing data.  
 **Mongoose:** Schema-based solution for MongoDB validation, casting, and business logic.  
 **Passport:** Flexible authentication middleware for Node.js. Used here to simplify OAuth2 flow.  
 **Socket.IO:** Event-driven library enabling real-time communication between browser client and backend.

### Setup Instructions

**MongoDB Atlas Setup**

1. Create an account for [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Follow the prompts to create a new cluster -- choose the free tier for testing purposes.
3. Navigate to 'Database Access' and create a new database user by setting a username and password.
4. Navigate to 'Network Access' and allow access from your IP address.
5. Navigate to 'Clusters' and click 'Connect' for your cluster. Choose to 'Connect your application'.
6. Copy the provided connection string into your .env file, setting it to variable `MONGO_URI`.

**Discord Bot Setup**

7.  Visit the [Discord Developer Portal](https://discord.com/developers/applications) and log in.
8.  Click 'New Application' to name and create a new Discord Application.
9.  Navigate to the 'Bot' tab and click 'Add Bot'.
10. In the 'Bot' section, click 'Reset Token', confirm, and copy the resulting Bot Token.
11. In the 'Privileged Gateway Intents' section, toggle on 'PRESENCE INTENT', 'SERVER MEMBERS INTENT', AND 'MESSAGE CONTENT INTENT'.
12. Navigate to the 'OAuth2' tab and copy 'CLIENT ID' and 'CLIENT SECRET'.
13. In the 'Redirects' section, set the Redirect URI to `http://localhost:3000/auth/callback`.
14. In the 'OAuth2 URL Generator' section, check 'applications.commands' and 'bot'. After a list of 'Bot Permissions' appears, check 'administrator' and copy the resulting link into your browser. Choose the server you want to add the bot to and click 'Authorize'.
15. Update the following environment variables in your .env file:

        APP_BASE_URL=http://localhost:3000
        DISCORD_BOT_TOKEN=your-bot-token
        DISCORD_CLIENT_ID=your-client-id
        DISCORD_CLIENT_SECRET=your-client-secret
        DISCORD_CALLBACK_URL=http://localhost:3000/auth/callback

16. Clone the repository with `git clone https://github.com/p-stoney/collaboration-discord-bot`.
17. Navigate to the project directory with `cd backend` + install dependencies with `npm install`.
18. Navigate to the frontend directory with `cd frontend` + install dependencies with `npm install`. Build static webpage with `npm run build`.
19. Ensure redis is running with `docker run --name redis -p 6379:6379 -d redis`. Use `redis-cli ping` to confirm.
20. Navigate back to project directory with `cd ..`. Build and start the application with `npm run start`. The application should now be running on `http://localhost:3000`.

### How to Interact

1.  In your Discord server, type `/help` to view all available slash commands.
2.  Type `register`, and the bot will provide a registration link to register your account with the application.
3.  Other available commands:

        `/create` to create a new document
        `/list` to list all accessible documents
        `/share` to share a document with another user
        `/open` to open a document in your browser for editing
        `/download` to download a document to your local machine

### Notes and Next Steps

This application is still in early development. My intention when creating this application was to better familiarize myself with TypeScript and intermediate Node.js concepts and application architecture -- specifically modular design, cross-cutting concerns (validation, pipes, filters, guards, etc.) and holistic infrastructure and integration.

Immediate-term development will involve improving user experience by replacing mere slash-command interactions with message components which would encapsulate interactions in buttons, select forms, modals, etc. Using the /share command as an example, its current form utilizes a cumbersome prompt/input approach. Message components are a strict necessity from an end-user perspective.

Future front-end development will include an embedded app interface for users to view and edit documents within the Discord application. The EventModule constitutes early backend logic for real-time collaborative editing and an embedded browser based extension of Discord chat. In the long term, this would ideally be accomplished via operational transformation.
