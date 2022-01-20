// import { suite, test } from '@testdeck/mocha'
import { suite, test } from '@testdeck/mocha'
import { expect, should } from 'chai'
import { spy } from 'sinon'
import { mock, instance } from 'ts-mockito'
import { EXPECT, EXPECT_EQL, EXPECT_NOT_NULL, EXPECT_NULL } from '../Utils/Expectation'
import Configuration from "../../src/App/Configuration/Configuration"
import GraphModel from '../../src/App/GraphModel/GraphModel'
import path from 'path'
import os from 'os'


should()
@suite class ConfigurationTests {

    private sut: Configuration // Singleton
    private pathToConf: string = path.join(os.homedir(), '.defaultConf.json')
    private fakePathToConf: string = 'fake-path'

    before() {
        this.sut = Configuration.get()
    }

    @test 'ShouldCorrectlyLoadConf'() {
        EXPECT(this.sut.loadConf(this.pathToConf), true)
    }

    @test 'ShouldNotFindAndLoadConf'() {
        EXPECT(this.sut.loadConf(this.fakePathToConf), false)
    }

    @test 'ShouldFindControlParameter'() {
        EXPECT_NOT_NULL(this.sut.param('ctrl'))
    }

    @test 'ShouldNotFindDummyParameter'() {
        EXPECT_NULL(this.sut.param('dummy'))
    }

    @test 'ShouldUpdateConfAndReloadSubscribers'() {

        const dummyUpdate = {
            "ctrl": 40,
            "test": 'string'
        }

        const gm = new GraphModel()
        const onConfReloadMock = spy(gm, 'onConfReload')

        this.sut.subscribeReloadable(gm)

        EXPECT(this.sut.loadConf(this.pathToConf), true)
        EXPECT(this.sut.updateCurrentConf(dummyUpdate), true)
        EXPECT(onConfReloadMock.calledOnce, true)
        EXPECT(this.sut.param('ctrl'), 40)
        EXPECT(this.sut.param('test'), 'string')
    }

    @test 'ShouldRemoveSubscribers'() {

        const gm = new GraphModel()
        this.sut.subscribeReloadable(gm)

        EXPECT(this.sut.unsubscribeReloadable(gm), true)
    }

}
