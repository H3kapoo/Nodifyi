// import { suite, test } from '@testdeck/mocha'
import { suite, test } from '@testdeck/mocha'
import { spy } from 'sinon'
import { should } from 'chai'
import { mock, instance } from 'ts-mockito'
import { EXPECT, EXPECT_EQL, EXPECT_NOT_NULL } from '../Utils/Expectation'
import Renderer from '../../src/App/Renderer/Renderer'


should()
@suite class RendererTests {

    private sut: Renderer

    before() {
        this.sut = new Renderer()
    }

    @test 'ShouldCorrectlyInitialize'() {
        EXPECT(this.sut.initialize(), true)
    }

}
