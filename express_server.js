const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");

const bcrypt = require("bcrypt");
const saltRounds = 10;
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", saltRounds),
  },
};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

function generateRandomString() {
  return Math.random().toString(36).substring(7, 15);
}

app.get("/", (req, res) => {
  const username = req.session["user_id"];
  if (username) {
    res.redirect("/urls");
    return;
  }

  res.redirect("/login");
});

// Send user to the register page when register is clicked
app.get("/register", (req, res) => {
  const templateVars = {
    username: req.session["user_id"],
    users,
  };
  const username = req.session["user_id"];
  if (username) {
    res.redirect("/urls");
    return;
  }

  res.render("urls_register", templateVars);
});

//Generate new user in db
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    return res.status(400).json({
      error:
        "Please dont leave password or email black, click the back arrow on the left top corner to re-register",
    });
  }

  for (const user in users) {
    if (users[user].email === email) {
      return res.status(400).json({
        error:
          "User Already exist, please click the back arrow on the left top corner to re-register",
      });
    }
  }
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password: bcrypt.hashSync(password, saltRounds),
  };

  req.session["user_id"] = id;

  res.redirect(301, `/urls`);
});

//direct user to login page
app.get("/login", (req, res) => {
  const username = req.session["user_id"];
  if (username) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    username: req.session["user_id"],
    users,
  };
  res.render("urls_login", templateVars);
});

//check if user exist, if it does log him/her in
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "" || password === "") {
    return res.status(400).json({
      error:
        "Please dont leave password or email black, click the back arrow on the left top corner to try login again ",
    });
  }

  for (const user in users) {
    if (
      users[user].email === email &&
      bcrypt.compareSync(password, users[user].password)
    ) {
      req.session["user_id"] = users[user].id;
      res.redirect(301, `/urls`);
      return;
    }
  }

  res.status(400).json({
    error:
      "Invalid Credentials,click the back arrow on the left top corner to try login again ",
  });
});

//log users out delete cookies
app.post("/logout", (req, res) => {
  res.clearCookie("session.sig");
  res.clearCookie("session");

  res.redirect(301, `/urls`);
});

//render out all the urls for the user
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.session["user_id"],
    users,
  };

  res.render("urls_index", templateVars);
});

//direct users to generate new shortURL page
app.get("/new", (req, res) => {
  const templateVars = {
    username: req.session["user_id"],
    users,
  };
  const username = req.session["user_id"];
  if (!username) {
    res.redirect("/login");
    return;
  }

  res.render("urls_new", templateVars);
});

//direct user to the edit URL page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    username: req.session["user_id"],
    users,
  };

  res.render("urls_show", templateVars);
});

//edited URL and bring users back to home page
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;

  const username = req.session["user_id"];
  if (username === urlDatabase[shortURL].userID) {
    const longURL = req.body.longURL;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(`/urls/`);
  }
});

//Generat new URL in db
app.post("/urls", (req, res) => {
  const result = generateRandomString();
  const username = req.session["user_id"];
  urlDatabase[result] = {};
  urlDatabase[result].longURL = req.body.longURL;
  urlDatabase[result].userID = username;

  res.redirect(301, `/urls/`);
});

//let user delete existing URL and redirect them to home page
app.post("/urls/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params;
  const username = req.session["user_id"];
  if (username === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  }

  res.redirect("/urls");
});

//redirect shortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;

  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
