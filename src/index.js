// let's go!
require("dotenv").config({ path: ".env" });
const createServer = require("./createServer");
const db = require("./db");
const cookieParser = require("cookie-parser");
const server = createServer();
const JWT = require("jsonwebtoken");

// TODO Use express middleware to handle cookes (JWT)
server.express.use(cookieParser());

server.express.use((req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    const { userId } = JWT.verify(token, process.env.APP_SECRET);
    req.userId = userId;
  }

  next();
});

server.express.use(async (req, res, next) => {
  if (!req.userId) next();

  const user = await db.query.user(
    { where: { id: req.userId } },
    "{id, permissions, email, name}"
  );

  req.user = user;
  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: [process.env.FRONTEND_URL, "localhost:7777"]
    }
  },
  deets => {
    console.log(
      `Servers is now running at port http://localhost:${deets.port}`
    );
  }
);
