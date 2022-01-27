// import { suite, test } from '@testdeck/mocha'
import { suite, test } from '@testdeck/mocha'
import { spy } from 'sinon'
import { should } from 'chai'
import { mock, instance, anything } from 'ts-mockito'
import GraphModel from '../../src/App/GraphModel/GraphModel'
import CircleNode from '../../src/App/GraphModel/CircleNode'
import GraphNodeBase from '../../src/App/GraphModel/GraphNodeBase'
import { EXPECT, EXPECT_EQL, EXPECT_NOT_NULL } from '../Utils/Expectation'

should()
@suite class GraphModelTests {

    private sut: GraphModel
    private node1: CircleNode
    private node2: CircleNode
    private node3: CircleNode

    before() {
        GraphNodeBase.testOnlyResetIdGiver()
        this.sut = new GraphModel()
        this.sut.initialize()
        this.node1 = new CircleNode(anything())
        this.node2 = new CircleNode(anything())
        this.node3 = new CircleNode(anything())
    }

    @test 'ShouldAddAndConnectNodes'() {

        this.sut.addNode(this.node1)
        this.sut.addNode(this.node2)
        this.sut.addNode(this.node3)

        this.sut.addConnection(this.node1.getUniqueId(), this.node2.getUniqueId(), {})
        this.sut.addConnection(this.node3.getUniqueId(), this.node2.getUniqueId(), {})

        const expectedModel = {
            0: { graphNode: this.node1, inIds: new Set(), outIds: new Set([1]) },
            1: { graphNode: this.node2, inIds: new Set([0, 2]), outIds: new Set() },
            2: { graphNode: this.node3, inIds: new Set(), outIds: new Set([1]) }
        }

        EXPECT_EQL(this.sut.getModel(), expectedModel)
        EXPECT_NOT_NULL(this.sut.findConnection(this.node1.getUniqueId(), this.node2.getUniqueId()))
        EXPECT_NOT_NULL(this.sut.findConnection(this.node3.getUniqueId(), this.node2.getUniqueId()))
    }

    @test 'ShouldRemoveNodesAndTheirConnections'() {
        const expectedModel = {
            2: { graphNode: this.node3, inIds: new Set(), outIds: new Set() }
        }

        this.sut.addNode(this.node1)
        this.sut.addNode(this.node2)
        this.sut.addNode(this.node3)

        this.sut.addConnection(this.node1.getUniqueId(), this.node2.getUniqueId(), {})
        this.sut.addConnection(this.node2.getUniqueId(), this.node3.getUniqueId(), {})

        EXPECT(this.sut.rmNode(this.node1.getUniqueId()), true)
        EXPECT(this.sut.rmNode(this.node2.getUniqueId()), true)
        EXPECT_EQL(this.sut.getModel(), expectedModel)
    }

    @test 'ShouldRemoveConnections'() {
        this.sut.addNode(this.node1)
        this.sut.addNode(this.node2)
        this.sut.addNode(this.node3)

        this.sut.addConnection(this.node1.getUniqueId(), this.node2.getUniqueId(), {})
        this.sut.addConnection(this.node3.getUniqueId(), this.node2.getUniqueId(), {})

        this.sut.rmConnection(this.node1.getUniqueId(), this.node2.getUniqueId())
        this.sut.rmConnection(this.node3.getUniqueId(), this.node2.getUniqueId())

        const expectedModel = {
            0: { graphNode: this.node1, inIds: new Set(), outIds: new Set() },
            1: { graphNode: this.node2, inIds: new Set(), outIds: new Set() },
            2: { graphNode: this.node3, inIds: new Set(), outIds: new Set() }
        }

        EXPECT_EQL(this.sut.getModel(), expectedModel)
        EXPECT_EQL(this.sut.getConnections(), {})
    }

    @test 'ShouldNotBeAbleToRemoveConnections'() {
        this.sut.addNode(this.node1)
        this.sut.addNode(this.node2)
        this.sut.addNode(this.node3)

        EXPECT(this.sut.rmConnection(this.node1.getUniqueId(), this.node2.getUniqueId()), false)
        EXPECT_EQL(this.sut.getConnections(), {})
    }

    @test 'ShouldBeAbleToAddConnectionsAndReturnThem'() {
        this.sut.addNode(this.node1)
        EXPECT(this.sut.addConnection(this.node1.getUniqueId(), 2, {}), null)
        EXPECT(this.sut.addConnection(-4, 2, {}), null)
    }

    @test 'ShouldNotBeAbleToAddConnections'() {
        this.sut.addNode(this.node1)
        this.sut.addNode(this.node2)
        EXPECT_NOT_NULL(this.sut.addConnection(this.node1.getUniqueId(), this.node2.getUniqueId(), {}))
    }

    @test 'ShouldFindAndReturnNodes'() {
        this.sut.addNode(this.node1)
        this.sut.addNode(this.node2)
        this.sut.addNode(this.node3)

        EXPECT(this.sut.findNode(this.node1.getUniqueId()).getUniqueId(), 0)
        EXPECT(this.sut.findNode(this.node2.getUniqueId()).getUniqueId(), 1)
        EXPECT(this.sut.findNode(this.node3.getUniqueId()).getUniqueId(), 2)
    }

    @test 'ShouldNotFindNodes'() {
        EXPECT(this.sut.findNode(this.node1.getUniqueId()), null)
        EXPECT(this.sut.findNode(this.node2.getUniqueId()), null)
        EXPECT(this.sut.findNode(this.node3.getUniqueId()), null)
    }
}

// const getMy54 = spy(this.sut_, 'getMy54')
// expect(this.sut_.getMy1()).to.equal(54)
// expect(getMy54.args[0]).to.be.equal(3)