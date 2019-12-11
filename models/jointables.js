module.exports = (connection, Sequelize, Movie, Director, Genre) => {
    return connection.define('joinTables', {
        id: { type: Sequelize.INTEGER, 
              autoIncrement: true, 
              primaryKey: true,
        },
        movieId: { type: Sequelize.INTEGER, 
                   reference: { 
                     model: Movie, 
                     key: 'id' 
                   } 
        },
        directorId: { type: Sequelize.INTEGER, 
                      reference: { 
                        model: Director, 
                        key: 'id' 
                      } 
        },
        genreId: { type: Sequelize.INTEGER, 
                   reference: { 
                     model: Genre, 
                     key: 'id' 
                   } 
        }
    })
}