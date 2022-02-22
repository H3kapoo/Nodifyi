/* Utility functions for the rendering engine*/

import { ConnectionPoints, Vec2d, Vec3d } from "../types"

/* TO BE UNCOVERED */
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

    /* If start and end is the same, it should not be handled */
    if (JSON.stringify(connStartPos) == JSON.stringify(connEndPos)) {
        return { start: null, control: null, end: null }
    }

    /* Calculate middle point */
    const middlePos: Vec2d = getMiddlePoint(connStartPos, connEndPos)

    /* Calculate _|_ vector and control poibt */
    const vecToDestPos: Vec2d = subtract2d(connEndPos, connStartPos)
    const vecToDestPos01: Vec2d = normalize(vecToDestPos)
    const forwardVec: Vec3d = [0, 0, 1]
    const dir3dToDestPos: Vec3d = [vecToDestPos01[0], vecToDestPos01[1], 0]
    let cpPos: Vec3d = crossProduct(dir3dToDestPos, forwardVec)
    cpPos = scalarMult3d(cpPos, connElevation) // move cp 'elev' pixels up _|_ to vecToDestPos line
    cpPos[0] += middlePos[0]
    cpPos[1] += middlePos[1]

    /* Calculate dir from srcPos to cp & from destPos to cp */
    const dirFromSrcToCp: Vec2d = subtract3d2d(cpPos, connStartPos)
    const dirFromDestToCp: Vec2d = subtract3d2d(cpPos, connEndPos)

    /* Create edge points on node with this dir and radii */
    const srcPosToCpAngle: number = angleFromVec(dirFromSrcToCp)
    const destPosToCpAngle: number = angleFromVec(dirFromDestToCp)
    let lineStart: Vec2d = [0, 0]
    let lineEnd: Vec2d = [0, 0]

    lineStart[0] = Math.cos(srcPosToCpAngle) * nodeStartRadius + connStartPos[0]
    lineStart[1] = Math.sin(srcPosToCpAngle) * nodeStartRadius + connStartPos[1]
    lineStart[0] = Math.trunc(lineStart[0] * 100) / 100
    lineStart[1] = Math.trunc(lineStart[1] * 100) / 100

    cpPos[0] = Math.trunc(cpPos[0] * 100) / 100
    cpPos[1] = Math.trunc(cpPos[1] * 100) / 100

    lineEnd[0] = Math.cos(destPosToCpAngle) * nodeEndRadius + connEndPos[0]
    lineEnd[1] = Math.sin(destPosToCpAngle) * nodeEndRadius + connEndPos[1]
    lineEnd[0] = Math.trunc(lineEnd[0] * 100) / 100
    lineEnd[1] = Math.trunc(lineEnd[1] * 100) / 100

    return { start: lineStart, control: [cpPos[0], cpPos[1]], end: lineEnd }
}

export function getBezierPointAtStep(t: number, startPos: Vec2d, controlPos: Vec2d, endPos: Vec2d): Vec2d {
    return [
        controlPos[0] + (1 - t) * (1 - t) * (startPos[0] - controlPos[0]) + t * t * (endPos[0] - controlPos[0]),
        controlPos[1] + (1 - t) * (1 - t) * (startPos[1] - controlPos[1]) + t * t * (endPos[1] - controlPos[1])
    ]
}

export function add2d(p: Vec2d, q: Vec2d): Vec2d {
    return [p[0] + q[0], p[1] + q[1]]
}

export function angleFromVec(p: Vec2d): number {
    /* Returns radians */
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
