// import your node modules
const express = require('express');
const db = require('./data/db.js');

// add your server code starting here
const port = 8333;
const server = express();
server.use(express.json());

const sendUserError = (status, message, res) => {
    res.status(status).json({errorMessage: message});
    return;
}

// DATA SHAPE
// {
//     posts: [
//         {
//             id: 1,
//             title: "I wish the ring had ...",
//             contents: "Guess who said this",
//             created_at: "2018-04-02 19:01:55",
//             updated_at: "2018-04-02 19:01:55"
//         }
//     ]
// }
//end of DATA SHAPE


// GET ALL POSTS
// server.get('/api/posts', (req, res) => {
//     //const { post } = req.body;
//     console.log(req.body);

//     db
//         .find()
//         .then(posts => {
//             res.json( {posts} )
//         })
//         .catch(error => {
//             console.log(error);
//             sendUserError(500, "The posts information could not be retrieved.", res);
//             return;
//         })

// })

////ASYNC!!!
//GET all posts
server.get('/api/posts', async(req, res) => {
    try {
        const posts = await db.find();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({message: 'The posts information could not be retrieved.', error: error})
    }
})
// //SORT BY url querry
// //localhost:8333/api/posts?sort_by=name
// server.get('/api/posts', (req, res) => {
//     const sortField = req.query.sort_by || 'id'; //!== sort_by
//     //cannot find posts
//     const response = posts.sort((a, b) => {
//         return a[sortField] < b[sortField] ? -1 : 1;
//     })
//     res.status(200).json(response);
// })

//GET POST BY ID
server.get('/api/posts/:id', (req, res) => {
    const id = req.params.id;
    db
        .findById(id)
        .then(post => {
            if (post.length === 0) {
                sendUserError(404, "The post with the specified ID does not exist.", res);
                return;
            } else {
                res.json({ post })
            }
        })
        .catch(error => {
            console.log(error);
            sendUserError(500, "The post information could not be retrieved.", res);
            return;
        })
})
//POST / CREATE new post
server.post('/api/posts', (req, res) => {
    const { title, contents } = req.body;
    if (!title || !contents) {
        sendUserError(400, "Please provide title and contents for the post.", res);
        return;
    }
    db
        .insert({ title, contents })
        .then(response => {
            res.status(201).json({"successNewId" : response});
        })
        .catch(error => {
            console.log(error);
            sendUserError(500, "There was an error while saving the post to the database", res);
            return;
        })        
})
//DELETE POST
server.delete('/api/posts/:id', (req, res) => {
    const { id  } = req.params;
    db
        .remove(id)
        .then(response => {
            if (response === 0) {
                sendUserError(404, "The post with the specified ID does not exist.", res);
                return; 
            } else {
                res.json({success: `User with id: ${id} removed from system`});
            }
        })
        .catch(error => {
            console.log(error);
            sendUserError(500, "The post could not be removed", res);
            return;
        })
})
// //PUT UPDATE
server.put('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    const { title, contents } = req.body;

    if(!title || !contents) {
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
        res.end();
    }
    db
        .update(id, { title, contents })
        .then(response => {
            if (response === 0) {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
                res.end();
            }
            db
                .findById(id)
                .then(post => {
                    if (post.length === 0) {
                        res.status(404).json({ message: "(NESTED) The post with the specified ID does not exist." });
                        res.end();
                    }
                    res.json(post);
                })
                .catch(error => {
                    res
                        .status(500)
                        .send({ message: "(NESTED) The post information could not be modified.", error: error.message });
                        res.end();
                })
        })
        .catch(error => {
            res
                .status(500)
                .send({ message: "The post information could not be modified.", error: error.message });
                res.end();
        })
})


server.listen(port, () => console.log(`Server is running on port ${port}`));

