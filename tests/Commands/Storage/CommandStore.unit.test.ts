// import { suite, test } from '@testdeck/mocha'
import { context, suite, test } from '@testdeck/mocha'
import { expect, should } from 'chai'
import { spy } from 'sinon'
import { EXPECT, EXPECT_EQL, EXPECT_NOT_NULL } from '../../Utils/Expectation'
import CommandStore from '../../../src/App/Commands/Storage/CommandStore'
import { CommandsStruct } from '../../../src/App/types'
import Configuration from '../../../src/App/Configuration/Configuration'
import os from 'os'
import path from 'path'


should()
@suite class CommandStoreTests {

    private sut: CommandStore
    private cs1: CommandsStruct = {}
    private cs2: CommandsStruct = {}
    private cs3: CommandsStruct = {}
    private cs4: CommandsStruct = {}

    private originalLogFunction = console.log;
    private output

    before() {
        Configuration.get().loadConf(path.join(os.homedir(), '.defaultConf.json'))

        this.sut = new CommandStore()

        this.cs1['testing1'] = {
            schema: {
                name: 'testing1',
                mandatory: []
            },
            logic: Function
        }

        this.cs1['testing2'] = {
            schema: {
                name: 'testing2',
                mandatory: []
            },
            logic: Function
        }

        this.cs2['testing2'] = {
            schema: {
                name: 'testing2',
                mandatory: []
            },
            logic: Function
        }

        this.cs3['testing3'] = {
            schema: {
                name: 'testing3',
                mandatory: []
            },
            logic: Function
        }
    }

    @test 'ShouldCorrectlyInitialize'() {
        EXPECT(this.sut.initialize(), true)
        EXPECT_NOT_NULL(this.sut.getCommands())
    }

    @test 'ShouldCorrectlyMergeStructs'() {
        // NOK from SE POV since mergeSources is private but needs to be done
        // as there is no other way to test it
        //@ts-ignore
        EXPECT_NOT_NULL(this.sut.mergeSources(this.cs1, this.cs3))
    }

    @test 'ShouldFailMergingStructs'() {
        // NOK from SE POV since mergeSoruces if private but needs to be done
        // as there is no other way to test it
        //@ts-ignore
        EXPECT(this.sut.mergeSources(this.cs1, this.cs2), null)
    }

    @test 'ShouldCorrectlyReturnCommands'() {

        const expected: CommandsStruct = {}
        expected['testing1'] = {
            schema: {
                name: 'testing1',
                mandatory: []
            },
            logic: Function
        }
        expected['testing2'] = {
            schema: {
                name: 'testing2',
                mandatory: []
            },
            logic: Function
        }
        expected['testing3'] = {
            schema: {
                name: 'testing3',
                mandatory: []
            },
            logic: Function
        }

        //@ts-ignore
        EXPECT_EQL(this.sut.mergeSources(this.cs1, this.cs3), expected)
    }

    @test 'ShouldReInitOnConfReload'() {
        Configuration.get().subscribeReloadable(this.sut)

        const onConfReloadMock = spy(this.sut, 'onConfReload')
        const initMock = spy(this.sut, 'initialize')

        Configuration.get().updateCurrentConf({})
        EXPECT(onConfReloadMock.calledOnce, true)
        EXPECT(initMock.returned(true), true)

    }

    @test 'ShouldFailReInitOnConfReload'() {
        Configuration.get().subscribeReloadable(this.sut)
        const onConfReloadMock = spy(this.sut, 'onConfReload')
        const initMock = spy(this.sut, 'initialize')

        Configuration.get().updateCurrentConf({ udPath: 'fake' })
        EXPECT(onConfReloadMock.calledOnce, true)
        EXPECT(initMock.returned(true), false)

        // restore conf data
        Configuration.get().updateCurrentConf({
            udPath: '/home/hekapoo/Documents/_Licence/nodify2/src/App/Commands/UserDefinedDummy'
        })
    }
}
