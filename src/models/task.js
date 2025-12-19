'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {}
  
  Task.init({
    title: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    completed: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    sequelize,
    modelName: 'Task',
  });
  
  return Task;
};
