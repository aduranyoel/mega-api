import {Router} from "express";
import mega from 'megajs';
import cache from '../src/cache';
import {Node} from '../model/node';

export const coursesRouter = Router();

const accounts = [
    {
        accountId: 1,
        email: 'beiiakotmghumoqgrh@niwghx.com',
        password: 'XXX',
        recovery: '1rqhvSPmPGSN-40KeWZjBw'
    },
    {
        accountId: 2,
        email: 'vjqpeuizcvbleytvqw@miucce.com',
        password: 'XXX',
        recovery: 'POFbAtEd3QRikCUNPF_vjQ'
    }
];
let interval;

coursesRouter.get('/', (req, res) => {
    res.json({
        response: getCoursesFromCache(),
        error: null
    })
});

coursesRouter.get('/reload', (req, res) => {
    getAllCourses().then(completed => {
        res.json({
            response: completed,
            error: null
        })
    })
});

coursesRouter.get('/embed', (req, res) => {
    const {path: string} = req.query;
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

coursesRouter.get('/:idCourse', (req, res) => {

    const idCourse = req.params['idCourse'];
    let courseFounded = null, response = null;
    for (let [account, course] of Object.entries(cache)) {
        const exist = (course as Node).children.find(c => c.nodeId === idCourse);
        if (exist) {
            courseFounded = exist;
            break;
        }
    }

    if (courseFounded) {
        response = getNodes(courseFounded);
    }

    res.json({
        response,
        error: null
    })
});

function getAllCourses() {
    return new Promise(resolve => {
        let readyAccounts = 0, totalAccounts = accounts.length, readyCourses = 0, totalCourses = 0;
        accounts.forEach(account => {
            const {accountId, ...login} = account;
            new mega.Storage(login, (err, res) => {
                ++readyAccounts;
                const courses = res.root.children.find(n => n.name === 'courses');
                if (courses) {
                    totalCourses += courses.children.length || 0;
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
            if ((readyAccounts === totalAccounts) && (readyCourses === totalCourses)) {
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
            ...(course as Node).children.map(c => {
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
    if (!Array.isArray(node.children)) return null;
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

export function initSyncCourses() {
    getAllCourses();
    interval = setInterval(getAllCourses, 24 * 60 * 60 * 1000)
}
