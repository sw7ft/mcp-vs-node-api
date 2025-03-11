const express = require('express');
const app = express();
app.use(express.json());

// In-memory storage for demonstration
let users = [];

// Traditional REST API endpoints
app.post('/users', (req, res) => {
  const { username, email, age } = req.body;
  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    age,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.get('/users', (req, res) => {
  const { age, username } = req.query;
  let filteredUsers = [...users];
  
  if (age) filteredUsers = filteredUsers.filter(user => user.age === parseInt(age));
  if (username) filteredUsers = filteredUsers.filter(user => user.username.includes(username));
  
  res.json(filteredUsers);
});

app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.put('/users/:id', (req, res) => {
  const { username, email, age } = req.body;
  const userIndex = users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
  
  users[userIndex] = {
    ...users[userIndex],
    username: username || users[userIndex].username,
    email: email || users[userIndex].email,
    age: age || users[userIndex].age
  };
  
  res.json(users[userIndex]);
});

app.delete('/users/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
  
  users = users.filter(u => u.id !== req.params.id);
  res.status(204).send();
});

app.listen(3000, () => console.log('Traditional API running on port 3000')); 