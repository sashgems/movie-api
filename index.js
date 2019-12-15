const express = require('express')
const models = require('./models')
const bodyParser = require('body-parser')
const Op = require('sequelize').Op
const http_port = 1337;
const app = express()
app.use(bodyParser.json());


app.get('/movies', (request, response) => {
    models.Movie.findAll({
        attributes: ["id", "title", "releaseDate", "rating", "runTime"],
        include: [{ attributes: ['id', 'name'], model: models.Director,
            // Ignore attributes of join table
            through: { attributes: [] },
        }, {
            attributes: ['id', 'name'],
            model: models.Genre,
            through: { attributes: [] },
        }],
     }).then((movies) => { 
        response.send(movies)
    })

})

// Single movie by ID number
app.get('/movies/:movieId', async (request, response) => {
    // Reference data to access :movieId => http:.../movies/65
    const { movieId } = request.params
    /* Finding a match where ID number corresponds to movies.id 
       Including model attributes */
    const match = await models.Movie.findAll({
        where: { id: movieId },
        attributes: ["id", "title", "releaseDate", "rating", "runTime"],
        include: [{
            attributes: ['id', 'name'],
            model: models.Director,
            through: { attributes: [] },
        }, {
            attributes: ['id', 'name'],
            model: models.Genre,
            through: { attributes: [] },
        }]
    })
    // Show match if match
    if (match) {
        response.send(match)
    } else {
        response.status(404).send('Please provide a valid ID to look up movie.')
    }
})

// Directors by ID number
app.get('/directors/:directorId', async (request, response) => {
    const { directorId } = request.params
    /* Finding a match where ID number corresponds to directors.id 
       Including model attributes */
    const match = await models.Director.findAll({
        where: { id: directorId },
        attributes: ['id', 'name'],
        include: [{
            attributes: ["id", "title", "releaseDate", "rating", "runTime"],
            model: models.Movie,
            through: { attributes: [] },
            // Nested genres model so they will not show separately
            include: [{ model: models.Genre, 
                         attributes: ['id', 'name'], 
                         through: { attributes: [] }}]
        }]
    })
    
    if (match) {
        response.send(match)
    } else {
        response.status(404).send('Please provide a valid ID to look up director.')
    }
})

app.get('/genres/:genreName', async (request, response) => {
    const { genreName } = request.params
    const match = await models.Genre.findAll({
        where: { name: genreName },
        attributes: ['id', 'name'],
        include: [{
            attributes: ["id", "title", "releaseDate", "rating", "runTime"],
            model: models.Movie,
            through: { attributes: [] },
            include: [ { model: models.Director, 
                         attributes: ['id', 'name'], 
                         through: { attributes: [] } } ]
        }]
    })
    // If there's a match, we waant to see it
    if (match) {
        response.send(match)
    } else {
        response.status(404).send('Please provide a valid name to look up genre.')
    }
})

// Post a movie
app.post('/movies', async (request, response) => {
    // Get request body, and isolate director and genre models from models.Movie
    const { directors, genres, ...restOfBody } = request.body

    // If directors, genres or movie info is not included in body, send error message
    if (
       !restOfBody.title ||
       !directors ||
       !restOfBody.releaseDate ||
       !restOfBody.rating ||
       !restOfBody.runTime ||
       !genres
    ) {

      response.status(400).send('The following attributes of movie are required: title, director(s), release date, rating, run time, and genre(s).') 

    } else {
     
        // Create new movie
        const newMovie = await models.Movie.create(restOfBody)

        response.status(201).send({ newMovie, directors: directorsToAdd, genres: genresToAdd })
    }    
})

app.all('*', (request, response) => {
    response.send('page not found fix address.')
})

// Message to send if port connection is successfully working
app.listen(http_port, () => {
    console.log('Server is up and running.')
})