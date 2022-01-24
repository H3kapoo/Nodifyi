// import { suite, test } from '@testdeck/mocha'
import { suite, test } from '@testdeck/mocha'
import { spy } from 'sinon'
import { expect, should } from 'chai'
import { mock, instance, anything } from 'ts-mockito'
import Parser from '../../../src/App/Commands/Parser/Parser'
import Executor from '../../../src/App/Commands/Executor/Executor'
import { EXPECT, EXPECT_EQL, EXPECT_ERROR, EXPECT_NOT_NULL } from '../../Utils/Expectation'
import { JSDOM } from 'jsdom'
import Configuration from '../../../src/App/Configuration/Configuration'
import { join } from 'path'
import { CommandsStruct, ParsedInput } from '../../../src/App/types'
import CommandStore from '../../../src/App/Commands/Storage/CommandStore'
import { parsers } from '../../../src/App/Commands/Parser/ValidTypesParser'

should()
@suite class ValidTypesParserTests {

    private sut: Object

    before() {
        this.sut = parsers
    }

    @test 'ShouldParseString'() {
        const input = "myString"
        EXPECT(this.sut['String'](input), input)
    }

    @test 'ShouldParseString2'() {
        const input = "myString,secondString"
        const output = ["myString", "secondString"]
        EXPECT_EQL(this.sut['String2'](input), output)
    }

    @test 'ShouldParseStringv'() {
        const input = "myString,secondString,anotherString"
        const output = ["myString", "secondString", "anotherString"]
        EXPECT_EQL(this.sut['Stringv'](input), output)
    }

    @test 'ShouldParseStringvs'() {
        const input = "myString|secondString,anotherString"
        const output = [["myString"], ["secondString", "anotherString"]]
        EXPECT_EQL(this.sut['Stringvs'](input), output)
    }

    @test 'ShouldParseString2vs'() {
        const input = "myString,lookStr|secondString,anotherString"
        const output = [["myString", "lookStr"], ["secondString", "anotherString"]]
        EXPECT_EQL(this.sut['String2vs'](input), output)
    }

    @test 'ShouldParseAbsNumber'() {
        const input = "30"
        const output = 30
        EXPECT_EQL(this.sut['AbsNumber'](input), output)
    }

    @test 'ShouldParseAbsNumber2'() {
        const input = "30,4"
        const output = [30, 4]
        EXPECT_EQL(this.sut['AbsNumber2'](input), output)
    }

    @test 'ShouldParseAbsNumberv'() {
        const input = "30,4,40,50"
        const output = [30, 4, 40, 50]
        EXPECT_EQL(this.sut['AbsNumberv'](input), output)
    }

    @test 'ShouldParseAbsNumbervs'() {
        const input = "30|4,40|50"
        const output = [[30], [4, 40], [50]]
        EXPECT_EQL(this.sut['AbsNumbervs'](input), output)
    }

    @test 'ShouldParseAbsNumber2vs'() {
        const input = "30,30|4,40|50,1"
        const output = [[30, 30], [4, 40], [50, 1]]
        EXPECT_EQL(this.sut['AbsNumber2vs'](input), output)
    }

    @test 'ShouldParseNumber'() {
        const input = "-330"
        const output = -330
        EXPECT_EQL(this.sut['Number'](input), output)
    }

    @test 'ShouldParseNumber2'() {
        const input = "-130,4"
        const output = [-130, 4]
        EXPECT_EQL(this.sut['Number2'](input), output)
    }

    @test 'ShouldParseNumberv'() {
        const input = "-30,4,40,-50"
        const output = [-30, 4, 40, -50]
        EXPECT_EQL(this.sut['Numberv'](input), output)
    }

    @test 'ShouldParseNumbervs'() {
        const input = "-30|4,-40|50"
        const output = [[-30], [4, -40], [50]]
        EXPECT_EQL(this.sut['Numbervs'](input), output)
    }

    @test 'ShouldParseNumber2vs'() {
        const input = "-30,30|4,40|50,-1"
        const output = [[-30, 30], [4, 40], [50, -1]]
        EXPECT_EQL(this.sut['Number2vs'](input), output)
    }

    @test 'ShouldFailOnTrailingComma'() {
        const input = "-30,"
        const func = this.sut['Numberv'].bind(this.sut)
        EXPECT_ERROR(func, input)
    }

    @test 'ShouldFailOnEmptyInput'() {
        const input = ""
        const func = this.sut['Numberv'].bind(this.sut)
        EXPECT_ERROR(func, input)
    }
}
