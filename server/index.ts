import express = require("express");
import cors from 'cors';
import path from 'path';

import {coursesRouter, initSyncCourses} from './routes/courses';

const app = express();

/**
 * Middleware
 */
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: '*',
    methods: 'GET',
}));
app.use(express.static(path.join(__dirname, "static")));
/**
 * Routes
 */
app.use('/api', coursesRouter);
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, "static", 'index.html'))
});
/**
 * Config
 */
app.set('port', process.env.PORT || 3001);
/**
 * Server
 */
app.listen(app.get('port'), () => {
    console.log(`Server running in port ${app.get('port')}`);
    initSyncCourses();
});
