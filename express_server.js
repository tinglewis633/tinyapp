const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).substring(7, 15);
}
app.set("view engine", "ejs");
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["user_id"],
    users,
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let result = generateRandomString();
  urlDatabase[result] = req.body.longURL;
  res.redirect(301, `/urls/`);
});

app.get("/login", (req, res) => {
  const templateVars = {
    username: req.cookies["user_id"],
    users,
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    return res.status(400).json({
      error:
        "Please dont leave password or email black, click the back arrow on the left top corner to re-register",
    });
  }

  for (const user in users) {
    if (users[user].email === email && users[user].password === password) {
      res.cookie("user_id", users[user].id);
      console.log("LOGIN SUCCESS");
    } else
      return res.status(400).json({
        error:
          "Invalid Credentials, click the back arrow on the left top corner to login again",
      });
  }

  res.redirect(301, `/urls`);
});

app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["user_id"],
    users,
  };
  res.render("urls_register", templateVars);
});
////////////
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    return res.status(400).json({
      error:
        "Please dont leave password or email black, click the back arrow on the left top corner to re-register",
    });
  }

  for (const user in users) {
    console.log(users[user].email);
    console.log(email);
    if (users[user].email === email) {
      return res.status(400).json({
        error:
          "User Already exist, please click the back arrow on the left top corner to re-register",
      });
    }
  }
  let id = generateRandomString();
  users[id] = {
    id,
    email,
    password,
  };
  res.cookie("user_id", id);
  console.log(users);
  res.redirect(301, `/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  console.log(users);
  res.redirect(301, `/urls`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["user_id"],
    users,
  };

  const username = req.cookies["user_id"];
  console.log(users);
  console.log(username);

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["user_id"],
    users,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { longURL } = req.body;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params;

  delete urlDatabase[shortURL];

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
