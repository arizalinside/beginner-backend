const bcrypt = require("bcrypt");
const helper = require("../helper/index");
const jwt = require("jsonwebtoken");
const { postUser, checkUser } = require("../model/users");

module.exports = {
  registerUser: async (request, response) => {
    const { user_email, user_password, user_name } = request.body;
    const salt = bcrypt.genSaltSync(10);
    const encryptPassword = bcrypt.hashSync(user_password, salt);
    const setData = {
      user_email,
      user_password: encryptPassword,
      user_name,
      user_role: 2,
      user_status: 0,
      user_created_at: new Date(),
    };
    try {
      const checkEmailUser = await checkUser(user_email);
      if (checkEmailUser.length >= 1) {
        return helper.response(response, 400, "Email has been registered");
      } else if (request.body.user_email === "") {
        return helper.response(response, 400, "Email can't be empty");
      } else if (request.body.user_email.search("@") < 1) {
        return helper.response(response, 400, "Email not valid");
      } else if (
        request.body.user_password.length < 8 ||
        request.body.user_password.length > 16
      ) {
        return helper.response(
          response,
          400,
          "Password must be 8 - 16 characters"
        );
      } else if (request.body.user_name === "") {
        return helper.response(response, 400, "Username can't be empty");
      } else {
        const result = await postUser(setData);
        return helper.response(response, 200, "Register Success", result);
      }
    } catch (error) {
      return helper.response(response, 400, "Bad Request");
    }
  },
  loginUser: async (request, response) => {
    try {
      const { user_email, user_password } = request.body;
      console.log(user_email);
      const checkDataUser = await checkUser(user_email);
      if (checkDataUser.length >= 1) {
        const checkPassword = bcrypt.compareSync(
          user_password,
          checkDataUser[0].user_password
        );
        console.log(checkPassword);
        if (checkPassword) {
          const {
            user_id,
            user_email,
            user_name,
            user_role,
            user_status,
          } = checkDataUser[0];
          let payload = {
            user_id,
            user_email,
            user_name,
            user_role,
            user_status,
          };
          if (payload.user_status === 0) {
            return helper.response(
              response,
              400,
              "Your account is not active. Please contact admin."
            );
          } else {
            const token = jwt.sign(payload, "RAHASIA", { expiresIn: "24h" });
            payload = { ...payload, token };
          }
          return helper.response(response, 200, "Login Success", payload);
        } else {
          return helper.response(response, 400, "Wrong Password!");
        }
      } else {
        return helper.response(
          response,
          400,
          "Email / Account is not registered!"
        );
      }
    } catch (error) {
      return helper.response(response, 400, "Bad Request");
    }
  },
  getUser: async (request, response) => {
    try {
      const result = await getUser();
      result.map((value) => delete value.user_password);
      client.setex("user", 3600, JSON.stringify(result));
      return helper.response(response, 200, "Get User Success", result);
    } catch (error) {
      return helper.response(response, 400, "Bad Request", error);
    }
  },
  patchUser: async (request, response) => {
    const salt = bcrypt.genSaltSync(10);
    const encryptPassword = bcrypt.hashSync(request.body.user_password, salt);
    const { id } = request.params;
    const setData = {
      user_password: encryptPassword,
      user_name: request.body.user_name,
      user_role: request.body.user_role,
      user_status: request.body.user_status,
      user_updated_at: new Date(),
    };
    try {
      const result = await patchUser(setData, id);
      return helper.response(response, 201, "User Updated", result);
    } catch (error) {
      return helper.response(response, 400, "Bad Request", error);
    }
  },
};
