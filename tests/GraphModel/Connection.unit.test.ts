// import { suite, test } from '@testdeck/mocha'
import { suite, test } from '@testdeck/mocha'
import { spy } from 'sinon'
import { should } from 'chai'
import { EXPECT, EXPECT_EQL, EXPECT_NOT_NULL } from '../Utils/Expectation'
import Connection from '../../src/App/GraphModel/Connection'
import CircleNode from '../../src/App/GraphModel/CircleNode'
import { anything } from 'ts-mockito'


should()
@suite class ConnectionTests {

    private sut: Connection

    @test 'ShouldReturnCorrectConnectionID'() {
        const n1 = new CircleNode(anything())
        const n2 = new CircleNode(anything())

        this.sut = new Connection(n1, n2, anything())

        EXPECT(this.sut.getConnectionId(), 1002)
    }
}
