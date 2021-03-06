import dateTime from '@server/utils/dateTime'

const Model = require('~/server/models')()

module.exports = class Category {
  static save (data) {
    if (!data.id) {
      return Model.Category.create({ ...data, created_at: dateTime() })
    } else {
      return Model.Category.update({ ...data, updated_at: dateTime() }, {
        where: { id: data.id }
      })
    }
  }

  static findOne (where) {
    return Model.Category.findOne({
      where
    })
  }

  static findAll (query) {
    return Model.Category.findAll(query)
  }

  static destroy (where) {
    return Model.Category.destroy({
      where
    })
  }
}
