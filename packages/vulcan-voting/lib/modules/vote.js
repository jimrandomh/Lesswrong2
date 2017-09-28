import { runCallbacksAsync, runCallbacks, addCallback } from 'meteor/vulcan:core';
import { createError } from 'apollo-errors';
import Votes from './votes/collection.js';
import Users from 'meteor/vulcan:users';

/*

Define voting operations

*/
const voteTypes = {}

/*

Add new vote types

*/
export const addVoteType = (voteType, voteTypeOptions) => {
  voteTypes[voteType] = voteTypeOptions;
}

addVoteType('upvote', {power: 1, exclusive: true});
addVoteType('downvote', {power: -1, exclusive: true});

addVoteType('angry', {power: -1, exclusive: true});
addVoteType('sad', {power: -1, exclusive: true});
addVoteType('happy', {power: 1, exclusive: true});
addVoteType('laughing', {power: 1, exclusive: true});

/*

Test if a user has voted on the client

*/
export const hasVotedClient = ({ document, voteType }) => {
  const userVotes = document.currentUserVotes;
  if (voteType) {
    return _.where(userVotes, { voteType }).length
  } else {
    return userVotes && userVotes.length
  }
}

/*

Calculate total power of all a user's votes on a document

*/
const calculateTotalPower = votes => _.pluck(votes, 'power').reduce((a, b) => a + b, 0);

/*

Test if a user has voted on the server

*/
const hasVotedServer = ({ document, voteType, user }) => {
  const vote = Votes.findOne({documentId: document._id, userId: user._id, voteType});
  return vote;
}

/*

Add a vote of a specific type on the client

*/
const addVoteClient = ({ document, collection, voteType, user, voteId }) => {

  const newDocument = {
    _id: document._id,
    baseScore: document.baseScore || 0,
    __typename: collection.options.typeName,
  };

  // create new vote and add it to currentUserVotes array
  const vote = createVote({ document, collectionName: collection.options.collectionName, voteType, user, voteId });
  newDocument.currentUserVotes = [...document.currentUserVotes, vote];

  // increment baseScore
  newDocument.baseScore += vote.power;

  return newDocument;
}

/*

Add a vote of a specific type on the server

*/
const addVoteServer = ({ document, collection, voteType, user, voteId }) => {

  // create vote and insert it
  const vote = createVote({ document, collectionName: collection.options.collectionName, voteType, user, voteId });
  delete vote.__typename;
  Votes.insert(vote);

  // update document score
  collection.update({_id: document._id}, {$inc: {baseScore: vote.power }});

  return vote;
}

/*

Cancel votes of a specific type on a given document (client)

*/
const cancelVoteClient = ({ document, voteType }) => {
  const vote = _.findWhere(document.currentUserVotes, { voteType });
  const newDocument = _.clone(document);
  if (vote) {
    // subtract vote scores
    newDocument.baseScore -= vote.power;

    const newVotes = _.reject(document.currentUserVotes, vote => vote.voteType === voteType);

    // clear out vote of this type
    newDocument.currentUserVotes = newVotes;
  
  }
  return newDocument;
}

/*

Clear *all* votes for a given document and user (client)

*/
const clearVotesClient = ({ document }) => {
  const newDocument = _.clone(document);
  newDocument.baseScore -= calculateTotalPower(document.currentUserVotes);
  newDocument.currentUserVotes = [];
  return newDocument
}

/*

Clear all votes for a given document and user (server)

*/
const clearVotesServer = ({ document, user, collection }) => {
  const votes = Votes.find({ documentId: document._id, userId: user._id}).fetch();
  if (votes.length) {
    Votes.remove({documentId: document._id});
    collection.update({_id: document._id}, {$inc: {baseScore: -calculateTotalPower(votes) }});
  }
}

/*

Cancel votes of a specific type on a given document (server)

*/
const cancelVoteServer = ({ document, voteType, collection, user }) => {

  const vote = Votes.findOne({documentId: document._id, userId: user._id, voteType})
  
  // remove vote object
  Votes.remove({_id: vote._id});

  // update document score
  collection.update({_id: document._id}, {$inc: {baseScore: -vote.power }});

  return vote;
}

/*

Determine a user's voting power for a given operation.
If power is a function, call it on user

*/
const getVotePower = ({ user, voteType, document }) => {
  const power = voteTypes[voteType] && voteTypes[voteType].power || 1;
  return typeof power === 'function' ? power(user, document) : power;
};

/*

Create new vote object

*/
const createVote = ({ document, collectionName, voteType, user, voteId }) => ({
  _id: voteId,
  documentId: document._id,
  collectionName,
  userId: user._id,
  voteType: voteType,
  power: getVotePower({user, voteType, document}),
  votedAt: new Date(),
  __typename: 'Vote'
});

/*

Optimistic response for votes

*/
export const performVoteClient = ({ document, collection, voteType = 'upvote', user, voteId }) => {

  const collectionName = collection.options.collectionName;
  let returnedDocument;

  console.log('// voteOptimisticResponse')
  console.log('collectionName: ', collectionName)
  console.log('document:', document)
  console.log('voteType:', voteType)

  // make sure item and user are defined
  if (!document || !user || !Users.canDo(user, `${collectionName.toLowerCase()}.${voteType}`)) {
    throw new Error(`Cannot perform operation '${collectionName.toLowerCase()}.${voteType}'`);
  }

  const voteOptions = {document, collection, voteType, user, voteId};

  if (hasVotedClient({document, voteType})) {

    console.log('action: cancel')
    returnedDocument = cancelVoteClient(voteOptions);
    // returnedDocument = runCallbacks(`votes.cancel.client`, returnedDocument, collection, user);

  } else {

    console.log('action: vote')

    if (voteTypes[voteType].exclusive) {
      clearVotesClient({document, collection, voteType, user, voteId})
    }

    returnedDocument = addVoteClient(voteOptions);
    // returnedDocument = runCallbacks(`votes.${voteType}.client`, returnedDocument, collection, user);

  }

  console.log('returnedDocument:', returnedDocument)

  return returnedDocument;  
}

/*

Server-side database operation

*/
export const performVoteServer = ({ documentId, voteType = 'upvote', collection, voteId, user }) => {
  
  const collectionName = collection.options.collectionName;
  const document = collection.findOne(documentId);

  console.log('// performVoteMutation')
  console.log('collectionName: ', collectionName)
  console.log('document: ', collection.findOne(documentId))
  console.log('voteType: ', voteType)
  
  const voteOptions = {document, collection, voteType, user, voteId};

  if (!document || !user || !Users.canDo(user, `${collectionName.toLowerCase()}.${voteType}`)) {
    const VoteError = createError('voting.no_permission', {message: 'voting.no_permission'});
    throw new VoteError();
  }

  if (hasVotedServer({document, voteType, user})) {

    console.log('action: cancel')

    // runCallbacks(`votes.cancel.sync`, document, collection, user);
    cancelVoteServer(voteOptions);
    // runCallbacksAsync(`votes.cancel.async`, vote, document, collection, user);
  
  } else {
  
    console.log('action: vote')

    if (voteTypes[voteType].exclusive) {
      clearVotesServer(voteOptions)
    }

    // runCallbacks(`votes.${voteType}.sync`, document, collection, user);
    addVoteServer(voteOptions);
    // runCallbacksAsync(`votes.${voteType}.async`, vote, document, collection, user);
  
  }

  const newDocument = collection.findOne(documentId);
  newDocument.__typename = collection.options.typeName;
  return newDocument;
  
}