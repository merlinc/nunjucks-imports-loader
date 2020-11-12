const proxyquire = require('proxyquire')
const sinon = require('sinon')

const mockLoaderUtils = {
  getOptions: sinon.spy(),
}

const adjustPaths = proxyquire('./adjust-paths', {
  'loader-utils': mockLoaderUtils,
})

describe('adjustPaths', () => {
  let processRun
  let thisScope

  beforeEach(function () {
    thisScope = {
      cacheable: () => {},
      resourcePath: '',
      callback: sinon.spy(),
    }

    processRun = adjustPaths.bind(thisScope)
  })

  context('without relative imports', function () {
    it('should leave import alone', function () {
      let content = processRun('{%- include "component/template.njk" -%}')
      expect(content).to.equal('{%- include "component/template.njk" -%}')
    })
  })

  context('with shallow relative imports', function () {
    it('should replace import path', function () {
      mockLoaderUtils.getOptions = sinon.fake.returns({
        searchPaths: ['/srv/site/modules'],
      })

      const callbackSpy = sinon.spy()
      processRun = adjustPaths.bind({
        cacheable: () => {},
        resourcePath: '/srv/site/modules/component/macro.njk',
        callback: callbackSpy,
      })

      processRun('{%- include "./template.njk" -%}')

      expect(callbackSpy).to.have.been.calledWith(
        null,
        '{%- include "component/template.njk" -%}',
        undefined
      )
    })

    it('should replace import path of different import names', function () {
      mockLoaderUtils.getOptions = sinon.fake.returns({
        searchPaths: ['/srv/site/modules'],
      })

      const callbackSpy = sinon.spy()
      processRun = adjustPaths.bind({
        cacheable: () => {},
        resourcePath: '/srv/site/modules/component/macro.njk',
        callback: callbackSpy,
      })

      processRun('{%- include "./grid-template.njk" -%}')

      expect(callbackSpy).to.have.been.calledWith(
        null,
        '{%- include "component/grid-template.njk" -%}',
        undefined
      )
    })
  })

  context.skip('with deep relative imports', function () {
    it('should replace parent import path', function () {
      mockLoaderUtils.getOptions = sinon.fake.returns({
        searchPaths: ['/srv/site/modules'],
      })

      const callbackSpy = sinon.spy()
      processRun = adjustPaths.bind({
        cacheable: () => {},
        resourcePath: '/srv/site/modules/component/macros/macro.njk',
        callback: callbackSpy,
      })

      processRun('{%- include "../template.njk" -%}')

      expect(callbackSpy).to.have.been.calledWith(
        null,
        '{%- include "component/template.njk" -%}',
        undefined
      )
    })

    it('should replace different directory path', function () {
      mockLoaderUtils.getOptions = sinon.fake.returns({
        searchPaths: ['/srv/site/modules'],
      })

      const callbackSpy = sinon.spy()
      processRun = adjustPaths.bind({
        cacheable: () => {},
        resourcePath: '/srv/site/modules/component/macros/macro.njk',
        callback: callbackSpy,
      })

      processRun('{%- include "../templates/template.njk" -%}')

      expect(callbackSpy).to.have.been.calledWith(
        null,
        '{%- include "component/templates/template.njk" -%}',
        undefined
      )
    })
  })

  context('with multiple relative imports', function () {
    it('should replace all import paths', function () {
      mockLoaderUtils.getOptions = sinon.fake.returns({
        searchPaths: ['/srv/site/modules'],
      })

      const callbackSpy = sinon.spy()
      processRun = adjustPaths.bind({
        cacheable: () => {},
        resourcePath: '/srv/site/modules/component/macro.njk',
        callback: callbackSpy,
      })

      const template = [
        '{%- include "./data-grid.njk" -%}',
        '{%- include "./data-column.njk" -%}',
        "{%- include './data-row.njk' -%}",
      ]

      processRun(template.join(''))

      expect(callbackSpy).to.have.been.calledWith(
        null,
        '{%- include "component/data-grid.njk" -%}{%- include "component/data-column.njk" -%}{%- include \'component/data-row.njk\' -%}',
        undefined
      )
    })
  })
})
