const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('./passport'); 

const inventoryRoutes = require('./routes/inventoryRoutes');
const itemRoutes = require('./routes/itemRoutes');
const authRoutes = require('./routes/authRoutes'); 
const searchRoutes = require('./routes/searchRoutes');
const statsRoutes = require('./routes/statsRoutes');
const accessRoutes = require('./routes/accessRoutes');
const commentRoutes = require('./routes/commentRoutes');
const customFieldRoutes = require('./routes/customFieldRoutes');
const likeRoutes = require('./routes/likeRoutes');
const tagRoutes = require('./routes/tagRoutes');
const userRoutes = require('./routes/userRoutes');
const app = express(); 
app.use(cors());
app.use(express.json()); 
app.use(session({
  secret: process.env.SESSION_SECRET || 'a-very-secret-key', 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use('/api/inventories', inventoryRoutes); 
app.use('/api/items', itemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/users', userRoutes);
app.get('/', (req, res) => {
  res.send('Inventory App API');
});
app.use((err, req, res, next) => { 
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
module.exports = app;