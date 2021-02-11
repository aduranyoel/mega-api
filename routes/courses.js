const
    express = require('express'),
    mega = require('megajs'),
    router = express.Router(),
    cache = require('../src/cache'),
    Node = require('../src/node'),
    logger = require('../src/logger'),
    accounts = [{accountId: 1, email: 'beiiakotmghumoqgrh@niwghx.com', password: 'Yoel44901'}];
let interval;

router.get('/', (req, res) => {
    res.json({
        response: getCoursesFromCache(),
        error: null
    })
});

router.get('/reload', (req, res) => {
    getAllCourses().then(completed => {
        res.json({
            response: completed,
            error: null
        })
    })
});

router.get('/embed', (req, res) => {
    const {path} = req.query;
    if (path) {
        const account = path.split('/')[0], url = path.split('/').slice(1).join('/');

        const wanted = find(url, cache[account]);
        if (wanted) {
            wanted.link((error, link) => {
                if (error) return responseError(error);
                res.json({
                    response: getEmbed(link),
                    error: null
                })
            })
        } else {
            responseError('File not found.')
        }
    } else {
        responseError('No path found.')
    }

    function responseError(message) {
        res.status(400).json({
            response: null,
            error: message
        })
    }
});

function getAllCourses() {
    return new Promise(resolve => {
        let readyAccounts = 0, totalAccounts = accounts.length, readyCourses = 0, totalCourses = 0;
        accounts.forEach(account => {
            const {accountId, ...login} = account;
            new mega.Storage(login, (err, res) => {
                ++readyAccounts;
                const courses = res?.root?.children?.find(n => n.name === 'courses');
                if (courses) {
                    totalCourses += courses?.children?.length || 0;
                    cache[accountId] = courses;
                    courses.children.forEach((course, index) => {
                        const data = course.children.find(c => c.name === 'data.json');
                        if (data) {
                            data.download((err, res) => {
                                if (!err && res) cache[accountId]['children'][index]['courseInfo'] = JSON.parse(res.toString());
                                ++readyCourses;
                                checkFinally();
                            });
                        } else {
                            ++readyCourses;
                            checkFinally();
                        }
                    });
                }
                checkFinally();
            });
        });

        function checkFinally() {
            if ((readyAccounts === totalAccounts) && readyCourses === totalCourses) {
            	logger('Courses loaded');
            	resolve(true);
			}
        }
    })
}

function getNodes(node) {
    const {name, nodeId, type, children, accountId, courseInfo} = node;
    return new Node({
        name, nodeId, type, accountId, courseInfo,
        children: Array.isArray(children) ? children.map(getNodes) : null
    });
}

function getCoursesFromCache() {
    return Object.entries(cache).reduce((acc, o) => {
        const [id, course] = o;
        acc = [
            ...acc,
            ...course.children.map(c => {
                c.accountId = id;
                return getNodes(c);
            })
        ];
        return acc;
    }, []);
}

function find(path, node) {
    const nodesPath = path.split('/');
    const isDeep = nodesPath.length > 1;
    if (!Array.isArray(node?.children)) return null;
    if (isDeep) {
        const directory = node.children.find(n => n.type === 1 && n.nodeId === nodesPath.slice(0, 1).join());
        if (directory) {
            return find(nodesPath.slice(1).join('/'), directory);
        } else {
            return null;
        }
    } else {
        return node.children.find(n => n.nodeId === nodesPath[0]);
    }
}

function getEmbed(url) {
    return url.replace('file', 'embed');
}

function initSyncCourses() {
    getAllCourses();
    interval = setInterval(getAllCourses, 24 * 60 * 60 * 1000)
}

module.exports = {
    coursesRouter: router,
    initSyncCourses
};
