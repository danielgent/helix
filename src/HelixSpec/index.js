import faker from 'faker'
import { isFunction, isNumber } from 'lodash'
import Exception from '../utils/log'
import generateSpecs from './generateSpecs'

/**
 * Class for a HelixSpec definition. This class contains methods to
 * generate the final fixture object, as well as methods to seed Faker
 * fixture data.
 *
 * @param object    $shape     Fixture shape, that contains Faker render API
 *
 * @returns class
 */
class HelixSpec {
  constructor (shape) {
    this.shape = shape
    this.seedValue = undefined
    this._afterGenerate = props => props
    return this
  }

  extend (...specs) {
    this.shape = Object.assign(this.shape, ...specs)
    return this
  }

  beforeGenerate (callback) {
    if (!isFunction(callback)) {
      throw Exception('HelixSpec.beforeGenerate()', 'Argument must be a valid function.')
    }
    this.shape = callback(this.shape)
    return this
  }

  afterGenerate (callback) {
    if (!isFunction(callback)) {
      throw Exception('HelixSpec.afterGenerate()', 'Argument must be a valid function.')
    }
    this._afterGenerate = callback
    return this
  }

  generate (count = 0, max) {
    if (!isNumber(count)) {
      throw Exception('HelixSpec.generate()', 'Argument must be a valid number.')
    }
    if (max !== undefined) {
      if (!isNumber(max)) {
        throw Exception('HelixSpec.generate()', 'Max argument must be a valid number.')
      }
      if (max <= count) {
        throw Exception('HelixSpec.generate()', 'Max argument must be larger than count argument.')
      }
      count = faker.random.number({min: count, max})
    }

    // If count was 0, max was specified, but the randomized count comes back 0, return []
    const isArray = count || max !== undefined
    const generatedSpecs = isArray
      ? [...Array(count)].map(() => {
        // Respect seed value for multi-generated specs
        this.seed(this.seedValue)
        return generateSpecs(this.shape, this.seedValue)
      })
      : generateSpecs(this.shape, this.seedValue)

    this.seedValue = undefined
    return this._afterGenerate(generatedSpecs)
  }

  seed (seedValue) {
    if (seedValue !== undefined && !isNumber(seedValue)) {
      throw new Exception(
        'HelixSpec.seed()',
        'Seed value must be a valid number.'
      )
    }
    if (seedValue !== undefined) {
      this.seedValue = seedValue
      faker.seed(this.seedValue)
    }
    return this
  }
}

export default HelixSpec
