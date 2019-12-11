'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    await queryInterface.createTable('movies', {
      id: { type: Sequelize.INTEGER, 
            autoIncrement: true, 
            primaryKey: true,
      },
      title: { type: Sequelize.STRING, },
      releaseDate: { type: Sequelize.STRING, },
      rating: { type: Sequelize.STRING, },
      runTime: { type: Sequelize.STRING, },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), },  
      deletedAt: { type: Sequelize.DATE },
    }) 
  
    await queryInterface.createTable('genres', {
      id: { type: Sequelize.INTEGER, 
            autoIncrement: true, 
            primaryKey: true,
      },
      name: { type: Sequelize.STRING, },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), },  
      deletedAt: { type: Sequelize.DATE },
    })

    await queryInterface.createTable('directors', {
      id: { type: Sequelize.INTEGER, 
            autoIncrement: true, 
            primaryKey: true,
      },
      name: { type: Sequelize.STRING, },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), },  
      deletedAt: { type: Sequelize.DATE },
    })

    return queryInterface.createTable('joinTables', {
      id: { type: Sequelize.INTEGER, 
            autoIncrement: true, 
            primaryKey: true,
      },
      movieId: { type: Sequelize.INTEGER, 
                 reference: { 
                   model: 'movies', 
                   key: 'id' 
                 } 
      },
      directorId: { type: Sequelize.INTEGER, 
                    reference: { 
                      model: 'directors', 
                      key: 'id' 
                    } 
      },
      genreId: { type: Sequelize.INTEGER, 
                 reference: { 
                   model: 'genres', 
                   key: 'id' 
                 } 
      },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), },  
      deletedAt: { type: Sequelize.DATE },
    })
    
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.
      Example:
      return queryInterface.dropTable('users');
    */
    await queryInterface.dropTable('joinTables')
    await queryInterface.dropTable('genres')
    await queryInterface.dropTable('directors')
    return queryInterface.dropTable('movies')
  }
};