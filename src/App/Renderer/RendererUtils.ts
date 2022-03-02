/* Utility functions for the rendering engine*/

import { ConnectionPoints, Vec2d, Vec3d } from "../types"

export function getArrowPoints(lineEndPos: Vec2d, cpPos: Vec2d, elevation: number = 15): ConnectionPoints {
    //calc direction of arrow
    let dirToEnd = subtract2d(lineEndPos, cpPos)

    //calc elevation point
    let angleDirToEnd = angleFromVec(dirToEnd)

    let ePos: Vec2d = [0, 0]
    ePos[0] = Math.cos(angleDirToEnd - Math.PI) * elevation + lineEndPos[0]
    ePos[1] = Math.sin(angleDirToEnd - Math.PI) * elevation + lineEndPos[1]

    //calc triangle base elev px away from line
    let dirToEnd01 = normalize(dirToEnd)
    let forwardVec: Vec3d = [0, 0, 1]
    let backwardVec: Vec3d = [0, 0, -1]

    let dir3dToEndPos: Vec3d = [dirToEnd01[0], dirToEnd01[1], 0]
    let p2: Vec3d = crossProduct(dir3dToEndPos, forwardVec)
    p2 = scalarMult3d(p2, elevation)
    let p22: Vec2d = [p2[0], p2[1]]
    p22 = add2d(p22, ePos)

    let p3 = crossProduct(dir3dToEndPos, backwardVec)
    p3 = scalarMult3d(p3, elevation)
    let p32: Vec2d = [p3[0], p3[1]]
    p32 = add2d(p32, ePos)

    return { start: lineEndPos, control: p22, end: p32 }
}

// quadratic
export function getBezierPoints(
    connStartPos: Vec2d, connEndPos: Vec2d,
    nodeStartRadius: number, nodeEndRadius: number, connElevation: number): ConnectionPoints {

    /* If start and end is the same, it should not be handled */
    if (JSON.stringify(connStartPos) == JSON.stringify(connEndPos)) {
        return { start: null, control: null, end: null }
    }

    /* Calculate middle point */
    const middlePos: Vec2d = getMiddlePoint(connStartPos, connEndPos)

    /* Calculate _|_ vector and control point */
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

export function getBezierPointsText(connStartPos: Vec2d, controlPoint: Vec2d, connEndPos: Vec2d,
    connElevation: number): Vec2d {

    /* If start and end is the same, it should not be handled */
    if (JSON.stringify(connStartPos) == JSON.stringify(connEndPos)) {
        return [0, 0]
    }

    /* Calculate middle point */
    const middlePos: Vec2d = getBezierPointAtStep(0.5, connStartPos, controlPoint, connEndPos)

    const dirToControl: Vec2d = normalize(subtract2d(controlPoint, middlePos))
    const newPos = add2d(scalarMult2d(dirToControl, connElevation), middlePos)

    return newPos
}

export function getBezierCubicPointText(center: Vec2d,
    startPos: Vec2d, controlPos1: Vec2d, controlPos2: Vec2d, endPos: Vec2d, elevation: number) {
    const pntOnCurve: Vec2d = getBezierPointAtStepCubic(0.5, startPos, controlPos1, controlPos2, endPos)
    const dir: Vec2d = normalize(subtract2d(pntOnCurve, center))
    return add2d(scalarMult2d(dir, elevation), pntOnCurve)
}

export function getBezierPointAtStepCubic(
    t: number, startPos: Vec2d, controlPos1: Vec2d, controlPos2: Vec2d, endPos: Vec2d): Vec2d {
    const oneMinusT = 1 - t
    const oneMinusTT = oneMinusT * oneMinusT
    const oneMinusTTT = oneMinusT * oneMinusTT
    return [
        oneMinusTTT * startPos[0] + 3 * oneMinusTT * t * controlPos1[0] + 3 * oneMinusT * t * t * controlPos2[0] + t * t * t * endPos[0],
        oneMinusTTT * startPos[1] + 3 * oneMinusTT * t * controlPos1[1] + 3 * oneMinusT * t * t * controlPos2[1] + t * t * t * endPos[1]
    ]
}

// quadratic
export function getBezierPointAtStep(t: number, startPos: Vec2d, controlPos: Vec2d, endPos: Vec2d): Vec2d {
    return [
        controlPos[0] + (1 - t) * (1 - t) * (startPos[0] - controlPos[0]) + t * t * (endPos[0] - controlPos[0]),
        controlPos[1] + (1 - t) * (1 - t) * (startPos[1] - controlPos[1]) + t * t * (endPos[1] - controlPos[1])
    ]
}

export function getAngleBetweenVectorsRads(vec1: Vec2d, vec2: Vec2d): number {
    return angleFromVec(subtract2d(vec2, vec1))
}

export function degToRad(degrees: number) {
    return degrees * (Math.PI / 180);
}
export function radToDeg(rads: number) {
    return rads * (180 / Math.PI);
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
