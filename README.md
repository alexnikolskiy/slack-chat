## Slack chat

### Requirements

You must have Node.js, npm and MongoDB installed on your machine. This project was built against the following versions:

- Node v10.13.0
- npm v6.4.1
- MongoDB v3.6.3

### Setup
- Clone this repo to your machine
- `cd` into the project folder and run `npm install`
- Rename `.env.dist` to `.env`  
- Rename `.config.dist` to `.config`
- Run `node utils/addRoom.js` to add a room
- Run `npm start`
- Navigate to http://localhost:3000  

### About
Chat like Slack on Socket.io and MongoDB. 

main features:
- authorization, registration
- group (rooms) chatting
- editing profile
- private messaging
- message editing
- writing a message using speech
- listening to messages

![alt text](https://res.cloudinary.com/dtv6nxle4/image/upload/v1550828176/screenshot.png)
