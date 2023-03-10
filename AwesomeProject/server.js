const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET;
const mongoUri = process.env.MONGODB_URI;

// Подключение к MongoDB
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Определение схемы и модели пользователя
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Регистрация пользователя
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Хеширование пароля с помощью bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание нового пользователя
    const newUser = new User({
      username,
      password: hashedPassword
    });

    // Сохранение пользователя в базе данных
    const savedUser = await newUser.save();

    // Генерация JWT-токена для авторизации
    const token = jwt.sign({ userId: savedUser._id }, jwtSecret);

    res.json({ token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
