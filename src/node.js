class Node {
    constructor({name, nodeId, type, children, accountId, courseInfo}) {
        this.name = name;
        this.nodeId = nodeId;
        this.type = type;
        this.children = children;
        this.accountId = accountId;
        this.courseInfo = courseInfo;
    }
}

module.exports = Node;
