jest.mock('../../models/user.model');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const User = require('../../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { login, signup } = require('../../controllers/auth.controller');