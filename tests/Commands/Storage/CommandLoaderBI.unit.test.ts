// import { suite, test } from '@testdeck/mocha'
import { suite, test } from '@testdeck/mocha'
import { should } from 'chai'
import { spy } from 'sinon'
import { EXPECT, EXPECT_EQL, EXPECT_NOT_NULL } from '../../Utils/Expectation'
import CommandLoaderBI from '../../../src/App/Commands/Storage/CommandLoaderBI'

should()
@suite class CommandLoaderBITests {

    private sut: CommandLoaderBI

    before() {
        this.sut = new CommandLoaderBI()
    }

    @test 'ShouldCorrectlyInitialize'() {
        const builtInMock = {
            1: {
                "schema": {
                    "name": 'testing1',
                    "mandatory": ["id"],
                    "id": "Number",
                    "ceva": "Number2"
                },
                async logic(parsedData, api) { }
            },
            2: {
                "schema": {
                    "name": 'testin2',
                    "mandatory": ["id"],
                    "id": "Number2",
                },
                async logic(parsedData, api) { }
            },
        }

        EXPECT(this.sut.initialize(builtInMock), true)
    }

    @test 'ShouldFailOnDupeName'() {
        const builtInMock = {
            1: {
                "schema": {
                    "name": 'testing1',
                    "mandatory": ["id"],
                    "id": "Numberv",
                    "ceva": "Numberv2"
                },
                async logic(parsedData, api) { }
            },
            2: {
                "schema": {
                    "name": 'testing1',
                    "mandatory": ["id"],
                    "id": "Numberv",
                    "ceva": "Numberv2"
                },
                async logic(parsedData, api) { }
            }
        }
        EXPECT(this.sut.initialize(builtInMock), false)
    }

    @test 'ShouldFailOnEmptyBuiltIn'() {
        EXPECT(this.sut.initialize({}), false)
    }

    @test 'ShouldFailOnEmptySchema'() {
        const builtInMockNoSchema = {
            1: {
                async logic(parsedData, api) { }
            },
        }

        EXPECT(this.sut.initialize(builtInMockNoSchema), false)
    }

    @test 'ShouldFailOnEmptyLogic'() {
        const builtInMockNoLogic = {
            1: {
                schema: {
                    mandatory: []
                }
            },
        }

        EXPECT(this.sut.initialize(builtInMockNoLogic), false)
    }

    @test 'ShouldFailOnEmptyName'() {
        const builtInMockNoName = {
            1: {
                schema: {
                    mandatory: []
                },
                async logic(parsedData, api) { }
            },
        }

        EXPECT(this.sut.initialize(builtInMockNoName), false)
    }

    @test 'ShouldFailOnEmptyMandatory'() {
        const builtInMockNoMandatory = {
            1: {
                schema: {
                    name: 'name'
                },
                async logic(parsedData, api) { }
            },
        }

        EXPECT(this.sut.initialize(builtInMockNoMandatory), false)
    }

    @test 'ShouldFailOnMandatoryMismatch'() {
        const builtInMockMandatoryWrong = {
            1: {
                schema: {
                    name: 'name',
                    mandatory: ['m', 'm2', 'm3'],
                    m: 'Numberv'
                },
                async logic(parsedData, api) { }
            },
        }

        EXPECT(this.sut.initialize(builtInMockMandatoryWrong), false)
    }

    @test 'ShouldFailOnUnknownArgType'() {
        const builtInMockUnknownArgType = {
            1: {
                schema: {
                    name: 'name',
                    mandatory: ['m'],
                    m: 'unknown'
                },
                async logic(parsedData, api) { }
            },
        }

        EXPECT(this.sut.initialize(builtInMockUnknownArgType), false)
    }
}
