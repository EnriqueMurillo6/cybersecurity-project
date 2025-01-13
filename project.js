const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

// Iniciar la aplicación Express
const app = express();
const port = 5000;

// Middleware para manejar el cuerpo de la solicitud como JSON
app.use(bodyParser.json());

// Middleware para servir archivos estáticos como HTML, CSS, JS
app.use(express.static(path.join(__dirname)));

// Conectar a la base de datos de MongoDB
mongoose.connect('mongodb://localhost:27017/todolist', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar con MongoDB', err));

// Crear un esquema de tareas
const taskSchema = new mongoose.Schema({
    text: String,
    completed: Boolean,
});

// Crear un modelo para la tarea
const Task = mongoose.model('Task', taskSchema);

// Crear un esquema de usuarios
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

// Crear un modelo para el usuario
const User = mongoose.model('User', userSchema);

// Ruta para servir la página de inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'project.html'));
});

// Ruta para el login
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Registro de usuario
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Usuario ya registrado' });
        }

        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: 'Usuario registrado con éxito', redirectTo: '/login.html' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar el usuario' });
    }
});

// Inicio de sesión de usuario
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
        }
        res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
});

// Obtener todas las tareas
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las tareas' });
    }
});

// Crear una nueva tarea
app.post('/tasks', async (req, res) => {
    const { text } = req.body;
    const newTask = new Task({ text, completed: false });

    try {
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al agregar la tarea' });
    }
});

// Marcar tarea como completada
app.put('/tasks/:id/complete', async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        task.completed = true;
        await task.save();
        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al completar la tarea' });
    }
});

// Eliminar una tarea
app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        await Task.findByIdAndDelete(id);
        res.status(200).json({ message: 'Tarea eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar la tarea' });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor en puerto ${port}`);
});
