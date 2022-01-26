// import { suite, test } from '@testdeck/mocha'
import { suite, test } from '@testdeck/mocha'
import { spy } from 'sinon'
import { should } from 'chai'
import { mock, instance, anything } from 'ts-mockito'
import { EXPECT, EXPECT_EQL, EXPECT_NOT_NULL } from '../Utils/Expectation'
import { ConnectionPoints, Vec2d, Vec3d } from '../../src/App/types'
import * as utils from '../../src/App/Renderer/RendererUtils'


should()
@suite class RendererUtilsTests {

    @test 'ShouldGetBezierPoints'() {
        const connStartPos: Vec2d = [10, 30]
        const connEndPos: Vec2d = [20, 50]
        const nodeStartRadius = 30
        const nodeEndRadius = 30
        const connElevation = 10

        const expectedOutput: ConnectionPoints = {
            start: [37.88, 41.05],
            end: [27.88, 21.05],
            control: [23.94, 35.52]
        }

        EXPECT_EQL(
            utils.getBezierPoints(connStartPos, connEndPos, nodeStartRadius, nodeEndRadius, connElevation),
            expectedOutput)
    }
    @test 'ShouldNotComputeBezierPointsIfStartEqualsEnd'() {
        const connStartPos: Vec2d = [10, 30]
        const connEndPos: Vec2d = [10, 30]
        const nodeStartRadius = 30
        const nodeEndRadius = 30
        const connElevation = 10

        const expectedOutput: ConnectionPoints = {
            start: null,
            end: null,
            control: null
        }

        EXPECT_EQL(
            utils.getBezierPoints(connStartPos, connEndPos, nodeStartRadius, nodeEndRadius, connElevation),
            expectedOutput)
    }

    @test 'ShouldAddVectors2D'() {
        EXPECT_EQL(utils.add2d([10, 10], [10, 20]), [20, 30])
    }

    @test 'ShouldReturnAngleFromVector'() {
        EXPECT(utils.angleFromVec([10, 30]), 1.2490457723982544)
    }

    @test 'ShouldMultiplyVectorByScalar2D'() {
        EXPECT_EQL(utils.scalarMult2d([10, 30], 2), [20, 60])
    }

    @test 'ShouldMultiplyVectorByScalar3D'() {
        EXPECT_EQL(utils.scalarMult3d([10, 30, 90], 2), [20, 60, 180])
    }

    @test 'ShouldCalculateCrossProduct'() {
        EXPECT_EQL(utils.crossProduct([10, 30, 90], [20, 30, 10]), [-2400, 1700, -300])
    }

    @test 'ShouldCalculateMiddlePoint'() {
        EXPECT_EQL(utils.getMiddlePoint([10, 30], [20, 30]), [15, 30])
    }

    @test 'ShouldCalculateMagnitude'() {
        EXPECT(utils.magnitude([3, 4]), 5)
    }

    @test 'ShouldNormalizeVector'() {
        EXPECT_EQL(utils.normalize([3, 4]), [0.6, 0.8])
    }

    @test 'ShouldSubtract2DVectors'() {
        EXPECT_EQL(utils.subtract2d([3, 4], [1, 1]), [2, 3])
    }

    @test 'ShouldSubtract3DVectorFrom2DVector'() {
        EXPECT_EQL(utils.subtract3d2d([3, 4, 4], [1, 1]), [2, 3])
    }
}
