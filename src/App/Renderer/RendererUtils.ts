// /* Utility functions for the rendering engine*/

import { ConnectionPoints, Vec2d, Vec3d } from "../types"

// export function getArrowPoints(lineEndPos, cpPos, elevation = 15) {
//     //calc direction of arrow
//     let dirToEnd = sub(lineEndPos, cpPos)

//     //calc elevation point
//     let angleDirToEnd = angleFromVec(dirToEnd)

//     let ePos = [0, 0]
//     ePos[0] = Math.cos(angleDirToEnd - Math.PI) * elevation + lineEndPos[0]
//     ePos[1] = Math.sin(angleDirToEnd - Math.PI) * elevation + lineEndPos[1]

//     //calc triangle base elev px away from line
//     let dirToEnd01 = norm(dirToEnd)
//     let forwardVec = [0, 0, 1]
//     let backwardVec = [0, 0, -1]

//     let dir3dToEndPos = [dirToEnd01[0], dirToEnd01[1], 0]
//     let p2 = cross(dir3dToEndPos, forwardVec)
//     p2 = scalarMult3d(p2, elevation)
//     p2 = add2d(p2, ePos)

//     let p3 = cross(dir3dToEndPos, backwardVec)
//     p3 = scalarMult3d(p3, elevation)
//     p3 = add2d(p3, ePos)

//     return { 'p1': lineEndPos, p2, p3 }
// }

export function getBezierPoints(
    connStartPos: Vec2d, connEndPos: Vec2d,
    nodeStartRadius: number, nodeEndRadius: number, connElevation: number): ConnectionPoints {

    //calc middle point
    const middlePos: Vec2d = getMiddlePoint(connStartPos, connEndPos)

    //calc perp vector & cp
    const vecToDestPos: Vec2d = subtract2d(connEndPos, connStartPos)
    const vecToDestPos01: Vec2d = normalize(vecToDestPos)
    const forwardVec: Vec3d = [0, 0, 1]
    const dir3dToDestPos: Vec3d = [vecToDestPos01[0], vecToDestPos01[1], 0]
    let cpPos: Vec3d = crossProduct(dir3dToDestPos, forwardVec)
    cpPos = scalarMult3d(cpPos, connElevation) // move cp 'elev' pixels up perpendicular to vecToDestPos line
    cpPos[0] += middlePos[0]
    cpPos[1] += middlePos[1]

    //calc dir from srcPos to cp & from destPos to cp
    const dirFromSrcToCp: Vec2d = subtract3d2d(cpPos, connStartPos)
    const dirFromDestToCp: Vec2d = subtract3d2d(cpPos, connEndPos)

    //create edge points on node with this dir and radii
    const srcPosToCpAngle: number = angleFromVec(dirFromSrcToCp)
    const destPosToCpAngle: number = angleFromVec(dirFromDestToCp)
    let lineStart: Vec2d = [0, 0]
    let lineEnd: Vec2d = [0, 0]

    lineStart[0] = Math.cos(srcPosToCpAngle) * nodeStartRadius + connStartPos[0]
    lineStart[1] = Math.sin(srcPosToCpAngle) * nodeStartRadius + connStartPos[1]

    lineEnd[0] = Math.cos(destPosToCpAngle) * nodeEndRadius + connEndPos[0]
    lineEnd[1] = Math.sin(destPosToCpAngle) * nodeEndRadius + connEndPos[1]

    return { start: lineStart, control: [cpPos[0], cpPos[1]], end: lineEnd }
}

// export function getConnIndexingPointWithElev(srcPos, controlPos, destPos, indexElev) {

//     let t = 0.5
//     let x = controlPos[0] + (1 - t) * (1 - t) * (srcPos[0] - controlPos[0]) + t * t * (destPos[0] - controlPos[0])
//     let y = controlPos[1] + (1 - t) * (1 - t) * (srcPos[1] - controlPos[1]) + t * t * (destPos[1] - controlPos[1])

//     let midPoint = middle(srcPos, destPos)
//     let vecToDestPos = sub(destPos, srcPos)
//     let vecToDestPos01 = norm(vecToDestPos)
//     let forwardVec = [0, 0, 1]
//     let backwardVec = [0, 0, -1]

//     let dir3dToDestPos = [vecToDestPos01[0], vecToDestPos01[1], 0]
//     let cpPos = ''
//     if (indexElev >= 0)
//         cpPos = cross(dir3dToDestPos, forwardVec)
//     else
//         cpPos = cross(dir3dToDestPos, backwardVec)

//     cpPos = scalarMult3d(cpPos, indexElev) // move cp 'elev' pixels up perpendicular to vecToDestPos line
//     cpPos[0] += midPoint[0]
//     cpPos[1] += midPoint[1]

//     let dir = sub(cpPos, midPoint)
//     dir = norm(dir)
//     dir = scalarMult2d(dir, indexElev)
//     let indexingPos = [x + dir[0], y + dir[1]]
//     return indexingPos
// }


export function renderText(context: CanvasRenderingContext2D, position: Vec2d, text: string): void {
    context.font = '0.60em Courier New'
    context.strokeStyle = "#00000011"
    context.fillStyle = "#00000066"
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.lineWidth = 2 // hardcoded
    context.fillText(text, position[0], position[1])
    context.strokeText(text, position[0], position[1])
}

export function renderLine(context: CanvasRenderingContext2D, startPos: Vec2d, endPos: Vec2d) {
    context.strokeStyle = '#00000011'
    context.lineWidth = 1 //hardcoded
    context.beginPath()
    context.moveTo(startPos[0], startPos[1])
    context.lineTo(endPos[0], endPos[1])
    context.stroke()
}

// export function debugNode(ctx_, vec, rad = 5) {
//     //node itself
//     ctx_.beginPath()
//     ctx_.arc(vec[0], vec[1], rad, 0, 2 * Math.PI)
//     ctx_.lineWidth = 4 //hardcoded
//     ctx_.strokeStyle = 'black'
//     ctx_.stroke()
// }

export function add2d(p: Vec2d, q: Vec2d) {
    return [p[0] + q[0], p[1] + q[1]]
}

export function angleFromVec(p: Vec2d): number {
    //returns rads
    return Math.atan2(p[1], p[0])
}

export function scalarMult2d(p: Vec2d, scale: number): Vec2d {
    return [p[0] * scale, p[1] * scale]
}

export function scalarMult3d(p: Vec3d, scale: number): Vec3d {
    return [p[0] * scale, p[1] * scale, p[2] * scale]
}

export function crossProduct(p: Vec3d, q: Vec3d): Vec3d {
    return [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]]
}

export function getMiddlePoint(p: Vec2d, q: Vec2d): Vec2d {
    return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]
}

export function magnitude(p: Vec2d): number {
    return Math.sqrt(p[0] ** 2 + p[1] ** 2)
}

export function normalize(p: Vec2d): Vec2d {
    return [p[0] / magnitude(p), p[1] / magnitude(p)]
}

export function subtract2d(p: Vec2d, q: Vec2d): Vec2d {
    return [p[0] - q[0], p[1] - q[1]]
}

export function subtract3d2d(p: Vec3d, q: Vec2d): Vec2d {
    return [p[0] - q[0], p[1] - q[1]]
}

// export function getNodeData(po, opt) {

//     const nodeDefaults = {
//         'color': 'black',
//         'radius': 30
//     }
//     if (po[opt] || po[opt] === 0)
//         return po[opt]
//     return nodeDefaults[opt]
// }

// export function getConnData(po, opt) {

//     const connDefaults = {
//         'color': 'black',
//         'directed': false, //conns are undir by default
//         'elev': 100
//     }

//     if (po[opt] || po[opt] === 0)
//         return po[opt]
//     return connDefaults[opt]
// }