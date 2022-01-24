// import { suite, test } from '@testdeck/mocha'
import { suite, test } from '@testdeck/mocha'
import { spy } from 'sinon'
import { should } from 'chai'
import { mock, instance } from 'ts-mockito'
import Parser from '../../../src/App/Commands/Parser/Parser'
import Executor from '../../../src/App/Commands/Executor/Executor'
import { EXPECT, EXPECT_EQL, EXPECT_NOT_NULL } from '../../Utils/Expectation'
import { JSDOM } from 'jsdom'
import Configuration from '../../../src/App/Configuration/Configuration'
import { join } from 'path'
import { CommandsStruct, ParsedInput } from '../../../src/App/types'
import CommandStore from '../../../src/App/Commands/Storage/CommandStore'


should()
@suite class ParserTests {

    private sut: Parser
    private executorMock: Executor
    private commandStore: CommandStore
    private commands: CommandsStruct

    async before() {
        const dom = await JSDOM.fromFile('src/index.html')
        global.document = dom.window.document
        Configuration.get().loadConf(join(__dirname, '../Storage/default.json'))
        this.executorMock = new Executor()
        this.commandStore = new CommandStore()
        this.commandStore.initialize()
        this.commands = this.commandStore.getCommands()
        this.sut = new Parser()
    }

    @test 'ShouldCorrectlyInitialize'() {
        EXPECT(this.sut.initialize(), true)
    }

    @test 'ShouldNotNotifySubscribers'() {
        EXPECT(this.sut.initialize(), true)

        const onInputParsedMock = spy(this.executorMock, 'onInputParsed')
        this.sut.onListenedKey("")

        EXPECT(onInputParsedMock.notCalled, true)
    }

    @test 'ShouldParseNotChainedInput'() {
        EXPECT(this.sut.initialize(), true)
        this.sut.subscribeCommands(this.commands)
        this.sut.subscribeOnParsed(this.executorMock)

        const input = "testing1 id 30"
        const expectedOutput: ParsedInput[] =
            [
                {
                    commandName: 'testing1',
                    options: { id: 30 }
                }
            ]
        const onInputParsedMock = spy(this.executorMock, 'onInputParsed')
        this.sut.onListenedKey(input)

        EXPECT(onInputParsedMock.calledWith(expectedOutput), true)
    }

    @test 'ShouldParseChainedInput'() {
        EXPECT(this.sut.initialize(), true)
        this.sut.subscribeCommands(this.commands)
        this.sut.subscribeOnParsed(this.executorMock)

        const input = "testing1 id 30 && testing2"
        const expectedOutput: ParsedInput[] =
            [
                {
                    commandName: 'testing1',
                    options: { id: 30 }
                },
                {
                    commandName: 'testing2',
                    options: {}
                }
            ]
        const onInputParsedMock = spy(this.executorMock, 'onInputParsed')
        this.sut.onListenedKey(input)

        EXPECT(onInputParsedMock.calledWith(expectedOutput), true)
    }

    @test 'ShouldNotFindCommand'() {
        EXPECT(this.sut.initialize(), true)
        this.sut.subscribeCommands(this.commands)
        this.sut.subscribeOnParsed(this.executorMock)

        const input = "dummy-cmd id"

        const onInputParsedMock = spy(this.executorMock, 'onInputParsed')
        this.sut.onListenedKey(input)

        EXPECT(onInputParsedMock.notCalled, true)
    }

    @test 'ShouldFailOnNotFoundOption'() {
        EXPECT(this.sut.initialize(), true)
        this.sut.subscribeCommands(this.commands)
        this.sut.subscribeOnParsed(this.executorMock)

        const input = "testing1 dummyopt dummyarg"

        const onInputParsedMock = spy(this.executorMock, 'onInputParsed')
        this.sut.onListenedKey(input)

        EXPECT(onInputParsedMock.notCalled, true)
    }

    @test 'ShouldOkParseIfOptionArgumentNotRequired'() {
        EXPECT(this.sut.initialize(), true)
        this.sut.subscribeCommands(this.commands)
        this.sut.subscribeOnParsed(this.executorMock)

        const input = "testing3 ceva"
        const expectedOutput: ParsedInput[] =
            [
                {
                    commandName: 'testing3',
                    options: { ceva: null }
                }
            ]
        const onInputParsedMock = spy(this.executorMock, 'onInputParsed')
        this.sut.onListenedKey(input)

        EXPECT(onInputParsedMock.calledWith(expectedOutput), true)
    }

    @test 'ShouldFailParseIfOptionArgumentNotProvided'() {
        EXPECT(this.sut.initialize(), true)
        this.sut.subscribeCommands(this.commands)
        this.sut.subscribeOnParsed(this.executorMock)

        const input = "testing3 id"
        const onInputParsedMock = spy(this.executorMock, 'onInputParsed')
        this.sut.onListenedKey(input)

        EXPECT(onInputParsedMock.notCalled, true)
    }

    @test 'ShouldFailParseIfArgumentIsOfWrongType'() {
        EXPECT(this.sut.initialize(), true)
        this.sut.subscribeCommands(this.commands)
        this.sut.subscribeOnParsed(this.executorMock)

        const input = "testing1 ceva bla"
        const onInputParsedMock = spy(this.executorMock, 'onInputParsed')
        this.sut.onListenedKey(input)

        EXPECT(onInputParsedMock.notCalled, true)
    }

    @test 'ShouldFailParseIfMandatoryOptionNotProvided'() {
        EXPECT(this.sut.initialize(), true)
        this.sut.subscribeCommands(this.commands)
        this.sut.subscribeOnParsed(this.executorMock)

        const input = "testing1 ceva 20,20"
        const onInputParsedMock = spy(this.executorMock, 'onInputParsed')
        this.sut.onListenedKey(input)

        EXPECT(onInputParsedMock.notCalled, true)
    }
}
