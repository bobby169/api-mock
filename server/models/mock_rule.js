/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mock_rule', {
    'id': {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    'mock_id': {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false
    },
    'rule': {
      type: DataTypes.TEXT,
      allowNull: false
    },
    'created_at': {
      type: DataTypes.DATE,
      allowNull: true
    },
    'updated_at': {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'mock_rule'
  });
};
