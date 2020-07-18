// global utility functions

module.exports.inEllipse = function (node, localPos) {
    // the menu is in ellipse shape
    let diff = localPos.sub(node.position);
    let a = node.width/2.*node.scale;
    let b = node.height/2.*node.scale;
    return diff.x*diff.x/a/a + diff.y*diff.y/b/b < 1.;
};