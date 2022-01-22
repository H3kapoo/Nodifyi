// import { suite, test } from '@testdeck/mocha'
import { suite, test } from '@testdeck/mocha'
import { should } from 'chai'
import { EXPECT, EXPECT_EQL, EXPECT_NOT_NULL } from '../../Utils/Expectation'
import CommandLoaderUD from '../../../src/App/Commands/Storage/CommandLoaderUD'
import path from 'path'


should()
@suite class CommandLoaderUDTests {

    private sut: CommandLoaderUD

    before() {
        this.sut = new CommandLoaderUD()
    }

    @test 'ShouldCorrectlyInitialize'() {
        EXPECT(this.sut.initialize(path.join(__dirname, 'UserDefinedDummy/Correct')), true)
    }

    @test 'ShouldFailOnDupeName'() {
        EXPECT(this.sut.initialize(path.join(__dirname, 'UserDefinedDummy/DupeName')), false)
    }

    @test 'ShouldFailOnNotFoundUDFolder'() {
        EXPECT(this.sut.initialize(path.join(__dirname, 'UserDefinedDummy/Fake')), false)
    }

    @test 'ShouldFailOnEmptySchema'() {
        EXPECT(this.sut.initialize(path.join(__dirname, 'UserDefinedDummy/NoSchema')), false)
    }

    @test 'ShouldFailOnEmptyLogic'() {
        EXPECT(this.sut.initialize(path.join(__dirname, 'UserDefinedDummy/NoLogic')), false)
    }

    @test 'ShouldFailOnEmptyName'() {
        EXPECT(this.sut.initialize(path.join(__dirname, 'UserDefinedDummy/NoName')), false)
    }

    @test 'ShouldFailOnEmptyMandatory'() {
        EXPECT(this.sut.initialize(path.join(__dirname, 'UserDefinedDummy/EmptyMandatory')), false)
    }

    @test 'ShouldFailOnMandatoryMismatch'() {

        EXPECT(this.sut.initialize(path.join(__dirname, 'UserDefinedDummy/MandatoryMismatch')), false)
    }

    @test 'ShouldFailOnUnknownArgType'() {
        EXPECT(this.sut.initialize(path.join(__dirname, 'UserDefinedDummy/UnknownArgType')), false)
    }

    @test 'ShouldFailOnInvalidFormat'() {
        EXPECT(this.sut.initialize(path.join(__dirname, 'UserDefinedDummy/InvalidFormat')), false)
    }
}
