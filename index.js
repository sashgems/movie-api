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
    /* Finding all movies with specific attributes 
       that include genre and director model attributes */
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
app.get('/movies/:movieId', async (request, response) => {
    // Referencing data to access :movieId => http:.../movies/65
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
    // If there's a match, show it
    if (match) {
        response.send(match)
    } else {
        response.status(404).send('Please provide a valid ID to look up movie.')
    }
})

// GET request for directors by ID number
app.get('/directors/:directorId', async (request, response) => {
    // Referencing data to access :directorId => ex: http:.../directors/34
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
       !restOfBody.title ||
       !directors ||
       !restOfBody.releaseDate ||
       !restOfBody.rating ||
       !restOfBody.runTime ||
       !genres
    ) {

      response.status(400).send('The following attributes of movie are required: title, director(s), release date, rating, run time, and genre(s).') 

    } else {

        // Iterate through each director name and get an ID from the database
        // Split director names with a comma if there is more than one in a post
        const directorNames = directors.split(', ')
        const directorsToAdd = await models.Director.findAll({
            attributes: ['id', 'name'],
            where: {
                [Op.or]: directorNames.map(director => {
                    return { name: director }
                })
            },
            raw: true
        })

        // Iterate through each genre name and get an ID from the database
        // Split genre names with a comma if there is more than one in a post
        const genreNames = genres.split(', ')
        const genresToAdd = await models.Genre.findAll({
            attributes: ['id', 'name'],
            where: {
                [Op.or]: genreNames.map(genre => {
                    return { name: genre }
                })
            },
            raw: true
        })

        /* If there is a difference between the directors listed in the request (directorsToAdd)
        and the directors from the database (directorNames):
            1. Loop through each director's name
            2. Confirm that they are not in the directorsToAdd
            3. Create records for new directors
        */
       if (directorsToAdd.length !== directorNames.length) {
            directorNames.forEach(async (name) => {
                /* Confirm that directorName does NOT exist in directorsToAdd:
                    1. Filter directorsToAdd by each directorName
                    2. If directorName is found in directorsToAdd, the filter 
                        will have a single array element in it
                        i. Check for a length of 1, and exit if true
                */
                if (directorsToAdd.filter(director => director.name === name).length === 1) {
                    return
                }
                
                const createdDirector = await models.Director.create({ name })
                // const createdDirector = { id: 23948, director }    <---- dummy data to check
                directorsToAdd.push(createdDirector)
            
            })                      
        }    
        
        /* If there is a difference between the genres listed in the request (genresToAdd)
        and the genres from the database (genreNames):
            1. Loop through each genre's name
            2. Confirm that they are not in the genresToAdd
            3. Create records for new genres
        */
        if (genresToAdd.length !== genreNames.length) {
            genreNames.forEach(async (name) => {
                /* Confirm that genreName does NOT exist in genresToAdd:
                    1. Filter genresToAdd by each genreName
                    2. If genreName is found in genresToAdd, the filter 
                        will have a single array element in it
                        i. Check for a length of 1, and exit if true
                */
                if (genresToAdd.filter(genre => genre.name === name).length === 1) {
                    return
                }

                const createdGenre = await models.Genre.create({ name })
                // const createdGenre = { id: 32948, genre }    <---- dummy data to check
                genresToAdd.push(createdGenre) 
            })    
                  
        }
            
        // Create new movie
        const newMovie = await models.Movie.create(restOfBody)

        // Add new JoinTables lookup table records for movies, directors & genres
        await genresToAdd.forEach(async (genre) => {
            await directorsToAdd.forEach(async (director) => {
                await models.JoinTables.create({ movieId: newMovie.id, directorId: director.id, genreId: genre.id })
            })
        })

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
    response.send('Uh-oh, page not found.')
})

// Message to send if port connection is successfully working
app.listen(http_port, () => {
    console.log('Server is up and running.')
})