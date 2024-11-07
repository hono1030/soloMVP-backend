// const express = require("express");
const express = require("express");
const knex = require("./knex");
const app = express();
const cors = require("cors");
const AWS = require("aws-sdk");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { Configuration, OpenAI } = require("openai");
const openaiRequest = require("./openaiRequest");
const authentication = require("./authentication");
const bcrypt = require("bcrypt");
const session = require("express-session");
const crypto = require("crypto");

const port = process.env.PORT || 8080;
const URL =
  process.env.FRONTEND_URL || "https://solomvp-discoverjp-frontend.netlify.app";

console.log(process.env.AWS_ACCESS_KEY_ID);
console.log(process.env.FRONTEND_URL);

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Create S3 service object
s3 = new AWS.S3({ apiVersion: "2006-03-01" });

// bcrypt
const saltRounds = 10;

// Generate a random secret key
const sessionSecretKey = crypto.randomBytes(32).toString("hex");

// middlewareConfiguration
app.set("trust proxy", 1);

// middleware
app.use(
  cors({
    origin: URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: sessionSecretKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Set cookie expiration (1 day here)
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : false, // Required for cross-origin cookies
    },
  })
);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/apiChat", authentication, async (req, res) => {
  messageContent = {
    "Travel Style": req.body.travel_style,
    "Preferred Activity Level": req.body.activity_level,
    "Interest in Cultural Experiences": req.body.cultural_experiences,
    "Transport Mode": req.body.transport_mode,
    "Travel Companions": req.body.travel_companions,
    "Cat Lover": req.cat_lover,
  };

  const openaiResponse = await openaiRequest(
    `${JSON.stringify(messageContent)}`
  );

  return res.status(201).json({ openaiResponse });
});

app.post(
  "/upload/:userId/:prefectureCode",
  authentication,
  upload.single("image"),
  async (req, res) => {
    const userId = req.params.userId;
    const prefectureCode = req.params.prefectureCode;

    try {
      // call S3 to retrieve upload file to specified bucket
      const uploadParams = {
        Bucket: "hono1030bucket",
        Key: `${prefectureCode}/${uuidv4()}.jpg`,
        Body: req.file.buffer,
      };

      // call S3 to retrieve upload file to specified bucket
      const uploadedImage = await s3.upload(uploadParams).promise();

      // save bucket / key to DB
      const savedImage = await knex
        .returning("*")
        .insert({
          bucket: uploadedImage.Bucket,
          key: uploadedImage.Key,
          user_id: userId,
          prefecture_code: prefectureCode,
        })
        .into("images");

      if (savedImage) {
        return res.status(201).json(`Image uploaded`);
      } else {
        res.status(400).json({
          error: "Failed to upload the image",
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.get("/images/:prefectureCode", authentication, async (req, res) => {
  const prefectureCode = req.params.prefectureCode;

  try {
    const allImagesOfPrefecture = await knex
      .select("*")
      .from("images")
      .where({ prefecture_code: prefectureCode });

    const allImagesUrl = allImagesOfPrefecture.map((image) => {
      const UrlParams = {
        Bucket: image.bucket,
        Key: image.key,
        Expires: 900,
      };
      return s3.getSignedUrl("getObject", UrlParams);
    });

    if (allImagesUrl) {
      return res.status(201).json({ allImagesUrl });
    } else {
      res.status(400).json({
        error: "Failed to retrieve the image",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/signup", async (req, res) => {
  try {
    const username = req.body.username;
    const plainPassword = req.body.password;

    // Hashing a password
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    const addedUserId = await knex("users").insert(
      {
        username: username,
        password: hashedPassword,
      },
      ["id"]
    );

    if (!addedUserId) {
      return res.status(400).json("Username is already taken");
    } else {
      res.status(201).json({ addedUserId });
    }
  } catch (ex) {
    if (ex.code == "23505") {
      return res.status(400).json({ message: "Username is already taken" });
    }

    res.status(500).json({ message: "An error occurred", error: ex.message });
  }
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const plainPassword = req.body.password;

  try {
    let userInfo = await knex("users")
      .where({ username })
      .select("id", "username", "password");

    if (userInfo.length === 0) {
      return res.status(400).json({ error: "Incorrect username or password" });
    }

    const isMatch = await bcrypt.compare(plainPassword, userInfo[0].password);

    if (!isMatch)
      return res.status(400).json({ error: "Incorrect username or password" });

    const { id, username: dbUserName } = userInfo[0];

    req.session.userid = id;
    req.session.username = dbUserName;

    res.status(201).json({ useid: id, username: dbUserName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("connect.sid"); // Clear session cookie
    res.status(200).json({ message: "Logout successful" });
  });
});

app.get("/sessions", async (req, res) => {
  if (req.session.userid && req.session.username) {
    return res.status(200).json({
      userid: req.session.userid,
      username: req.session.username,
    });
  } else {
    res.status(401).send("User Not Logged In");
  }
});

app.get("/", (req, res) => {
  res.send("API is runnnig...");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
