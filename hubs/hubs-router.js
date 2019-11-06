const express = require('express');

const Hubs = require('./hubs-model.js');
const Messages = require('../messages/messages-model.js');

const router = express.Router();router.use((req, res, next) => {
  console.log('SOMETHING CAME INTO THE HUBS ROUTER!!!!!!!!');
  // next('I am being nasty and calling next with an argument!!!!!!!!');
  // throw new Error('argghhh!!!!!')
  next();
})

function checkThatReqHasBody(req, res, next) {
  if (Object.keys(req.body).length) {
    next();
  } else {
    res.status(400).json({ message: "Please provide a valid post to create" });
  }
}

function checkThatBodyHasLegitName(req, res, next) {
  // implement
}

// this middleware checks that the id param
// can be parsed as a number, if so then proceed
// otherwise send a good response to client
function isValidParamId(req, res, next) {
  const { id } = req.params;
  if (parseInt(id) > 0) {
    next();
  } else {
    res.status(400).json({ message: 'Hub id must be valid number' });
  }
}
// custom middleware
// takes req, res (as usual)
// takes and additional parameter next (allows the request to proceed)
// let's find the hub with the given id from params
// if it's legit, we tack it to the req object and allow to proceed
// otherwise we send the client a 404
function checkHubsId(req, res, next) {
  Hubs.findById(req.params.id)
    .then(hub => {
      if (hub) {
        req.hub = hub;
        next()
      } else {
        res.status(404).json({ message: 'Hub id does not correspond with an actual hub' });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Something terrible happend while checking hub id: ' + error.message,
      });
    });
}



// this only runs if the url has /api/hubs in it
router.get('/', (req, res) => {
  Hubs.find(req.query)
  .then(hubs => {
    res.status(200).json(hubs);
  })
  .catch(error => {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error retrieving the hubs',
    });
  });
});

// /api/hubs/:id

router.get('/:id', (req, res) => {
  Hubs.findById(req.params.id)
  .then(hub => {
    if (hub) {
      res.status(200).json(hub);
    } else {
      res.status(404).json({ message: 'Hub not found' });
    }
  })
  .catch(error => {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error retrieving the hub',
    });
  });
});

router.post('/', (req, res) => {
  Hubs.add(req.body)
  .then(hub => {
    res.status(201).json(hub);
  })
  .catch(error => {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error adding the hub',
    });
  });
});

router.delete('/:id', (req, res) => {
  Hubs.remove(req.params.id)
  .then(count => {
    if (count > 0) {
      res.status(200).json({ message: 'The hub has been nuked' });
    } else {
      res.status(404).json({ message: 'The hub could not be found' });
    }
  })
  .catch(error => {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error removing the hub',
    });
  });
});

router.put('/:id', (req, res) => {
  Hubs.update(req.params.id, req.body)
  .then(hub => {
    if (hub) {
      res.status(200).json(hub);
    } else {
      res.status(404).json({ message: 'The hub could not be found' });
    }
  })
  .catch(error => {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error updating the hub',
    });
  });
});

// add an endpoint that returns all the messages for a hub
// this is a sub-route or sub-resource
router.get('/:id/messages', (req, res) => {
  Hubs.findHubMessages(req.params.id)
  .then(messages => {
    res.status(200).json(messages);
  })
  .catch (error => {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error getting the messages for the hub',
    });
  });
});

// add an endpoint for adding new message to a hub
router.post('/:id/messages', (req, res) => {
  const messageInfo = { ...req.body, hub_id: req.params.id };

  Messages.add(messageInfo)
  .then(message => {
    res.status(210).json(message);
  })
  .catch(error => {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error getting the messages for the hub',
    });
  });
});

module.exports = router;
