import express from 'express';

const app = express();

app.listen (5001, () => {
    console.log('Server is running on port 5001');
});

app.get('/api/task', (req, res) => {
    res.send('10 task todo');
});