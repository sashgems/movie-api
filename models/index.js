const Sequelize = require('sequelize')
const allConfigs = require('../config/sequelize')

// movie, director and genre tables
const MovieModel = require('./movies')
const DirectorModel = require('./directors')
const GenreModel = require('./genres')
// Join table
const joinModel = require('./joinTables')

const config = allConfigs['development']

// Sequelize connection
const connection = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
})

// movie, director and genre connection
const Movie = MovieModel(connection, Sequelize)
const Director = DirectorModel(connection, Sequelize)
const Genre = GenreModel(connection, Sequelize)
// Join table connection
const JoinTables = joinModel(connection, Sequelize, Movie, Director, Genre)

// Movies have many directors - n:m
Movie.belongsToMany(Director, { through: 'joinTables', foreignKey: 'movieId' })
// And many genres
Movie.belongsToMany(Genre, { through: 'joinTables', foreignKey: 'movieId' })

// Directors have directed many movies - n:m
Director.belongsToMany(Movie, { through: 'joinTables', foreignKey: 'directorId' })
// And many genres relate
Director.belongsToMany(Genre, { through: 'joinTables', foreignKey: 'directorId' })

// Genres can be in many movies - n:m
Genre.belongsToMany(Movie, { through: 'joinTables', foreignKey: 'genreId' })
// And many directors have directed movies with many genres
Genre.belongsToMany(Director, { through: 'joinTables', foreignKey: 'genreId' })

// Join table relation to other tables
JoinTables.belongsTo(Movie, { foreignKey: 'movieId' })
JoinTables.belongsTo(Director, { foreignKey: 'directorId' })
JoinTables.belongsTo(Genre, { foreignKey: 'genreId' })

// Exporting models
module.exports = {
    JoinTables,
    Director,
    Genre,
    Movie,
}