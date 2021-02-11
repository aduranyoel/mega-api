const
    express = require('express'),
    app = express(),
    cors = require('cors'),
    path = require('path'),
    logger = require('./src/logger'),
    {coursesRouter, initSyncCourses} = require(path.join(__dirname, 'routes', 'courses'));

/**
 * Middleware
 */
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: '*',
    methods: 'GET',
}));
/**
 * Routes
 */
app.use('/courses', coursesRouter);
/**
 * Config
 */
app.set('port', process.env.PORT || 3001);
/**
 * Server
 */
app.listen(app.get('port'), () => {
    logger(`Server running in port ${app.get('port')}`);
    initSyncCourses();
});
