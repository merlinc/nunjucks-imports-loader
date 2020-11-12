const chai = require('chai')
const sinon = require('sinon')

chai.use(require('sinon-chai'))

global.expect = chai.expect
global.sinon = sinon

