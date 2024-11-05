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
const bcrypt = require("bcrypt");

const port = process.env.PORT || 8080;
console.log(process.env.AWS_ACCESS_KEY_ID);

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// bcrypt
const saltRounds = 10;

// Create S3 service object
s3 = new AWS.S3({ apiVersion: "2006-03-01" });

// middlewareConfiguration,
app.use(cors());
app.use(express.json());

// Call S3 to list the buckets
// s3.listBuckets(function (err, data) {
//   if (err) {
//     console.log("Error", err);
//   } else {
//     console.log("Success", data.Buckets);
//   }
// });

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/apiChat", async (req, res) => {
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

      console.log(savedImage);
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

app.get("/images/:prefectureCode", async (req, res) => {
  const prefectureCode = req.params.prefectureCode;

  try {
    const allImagesOfPrefecture = await knex
      .select("*")
      .from("images")
      .where({ prefecture_code: prefectureCode });

    const allImagesUrl = allImagesOfPrefecture.map((image) => {
      console.log(image);
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

app.get("/", (req, res) => {
  res.send("API is runnnig...");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
