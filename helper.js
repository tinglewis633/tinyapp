const checkEmail = function (email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
};

const generateRandomString = function () {
  return Math.random().toString(36).substring(7, 15);
};

const checkEmptyInput = function (email, password) {
  if (email === "" || password === "") {
    return true;
  }
};

module.exports = {
  generateRandomString,
  checkEmptyInput,
  checkEmail,
};
