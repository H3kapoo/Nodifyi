import { expect } from 'chai'

export function EXPECT(r: any, e: any) {
    expect(r).to.be.equal(e)
}

export function EXPECT_EQL(r: any, e: any) {
    expect(r).to.be.eql(e)
}

export function EXPECT_NOT_NULL(r: any) {
    expect(r).to.be.not.null
}

export function EXPECT_NULL(r: any) {
    expect(r).to.be.null
}