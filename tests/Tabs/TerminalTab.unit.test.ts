import { suite, test } from '@testdeck/mocha'
import { should } from 'chai'
import TerminalTab from '../../src/App/Tabs/TerminalTab'

should()
@suite class GraphModelTests {

    private sut: TerminalTab

    before() {
        /** Not testable in as unit/module at the moment
         * but there shouldn't be any problem with that
         */
    }
}