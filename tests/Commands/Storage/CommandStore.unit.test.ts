// import { suite, test } from '@testdeck/mocha'
import { suite, test } from '@testdeck/mocha'
import { spy } from 'sinon'
import { should } from 'chai'
import { mock, instance } from 'ts-mockito'
import Parser from '../../../src/App/Commands/Parser/Parser'
import { EXPECT, EXPECT_EQL, EXPECT_NOT_NULL } from '../../Utils/Expectation'
import TerminalTab from '../../../src/App/Tabs/TerminalTab'
import CommandStore from '../../../src/App/Commands/Storage/CommandStore'


should()
@suite class CommandStoreTests {

    private sut: CommandStore

    before() {
        this.sut = new CommandStore()
    }

    @test 'd'() {
    }
}
