const express = require('express')
// Model imports
const models = require('./models')
const bodyParser = require('body-parser')
// Allows use of Sequelize operators
const Op = require('sequelize').Op
const http_port = 1337;
// References Express app objects
const app = express()

// Uses body-parser throughout whole document
app.use(bodyParser.json());


// GET handle to return all movies
app.get('/movies', (request, response) => {

    models.Movie.findAll({
        attributes: ["id", "title", "releaseDate", "rating", "runTime"],
        include: [{
            attributes: ['id', 'name'],
            model: models.Director,
            // Ignoring attributes of join table
            through: { attributes: [] },
        }, {
            attributes: ['id', 'name'],
            model: models.Genre,
            through: { attributes: [] },
        }],
     }).then((movies) => {   // <---  if no async or await
        response.send(movies)
    })

})

// GET request for a single movie by ID number
app.get('/movies/:x', async (request, response) => {
    const { movieId } = request.params
    
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
    // If there's a match, show it
    if (match) {
        response.send(match)
    } else {
        response.status(404).send('Please provide a valid ID to look up movie.')
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
    // If there's a match, show it
    if (match) {
        response.send(match)
    } else {
        response.status(404).send('Please provide a valid name to look up genre.')
    }
})

// POST request to create a movie entry
app.post('/movies', async (request, response) => {
    // Get request body, and isolate director and genre models from models.Movie
    const { directors, genres, ...restOfBody } = request.body

    // If directors, genres or movie info is not included in body, send error message
    if (
       !title ||
       !directors ||
       !eleaseDate ||
       !rating ||
       !runTime ||
       !genres
    ) {
       
        // Create new movie
        const newMovie = await models.Movie.create(restOfBody)

        response.status(201).send({ newMovie, directors: directorsToAdd, genres: genresToAdd })
    }    
})

// DELETE request by movie ID number
app.delete('/movies/:movieId', async (request, response) => {
    const { movieId } = request.params
    const deleteMovie = await models.Movie.destroy({
        where: { id: movieId }
    })

    const deleteJoinEntry = await models.JoinTables.destroy({
        where: { id: movieId }
    })

    response.status(202).send("You have successfully deleted all entries.", { deleteMovie, deleteJoinEntry })
})

// Message to send if page is incorrectly put in
app.all('*', (request, response) => {
    response.send('page not found.')
})

// Message to send if port connection is successfully working
app.listen(http_port, () => {
    console.log('Server is up and running.')
})