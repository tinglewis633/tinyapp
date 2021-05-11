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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let result = generateRandomString();
  urlDatabase[result] = req.body.longURL;
  res.redirect(301, `/urls/`);
});

app.post("/login", (req, res) => {
  const { username } = req.body;
  res.cookie("username", username);
  res.redirect(301, `/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect(301, `/urls`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { longURL } = req.body;
  console.log(shortURL);
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
