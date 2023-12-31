import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { Roles } from 'meteor/alanning:roles';
import BaseCollection from '../base/BaseCollection';
import { ROLE } from '../role/Role';

export const roomResourcePublications = {
  resource: 'Resource',
  resourceAdmin: 'ResourceAdmin',
};

class RoomResourceCollection extends BaseCollection {
  constructor() {
    super('RoomResources', new SimpleSchema({
      roomNumber: String,
      capacity: {
        type: Number,
        min: 0,
        defaultValue: 0,
      },
      chairs: {
        type: Number,
        min: 0,
        defaultValue: 0,
      },
      desks: {
        type: Number,
        min: 0,
        defaultValue: 0,
      },
      phoneNumber: String,
      tv: [Object],
      'tv.$.number': String,
      'tv.$.location': {
        type: String,
      },
      dataJacks: [Object],
      'dataJacks.$.number': String,
      'dataJacks.$.location': {
        type: String,
      },
    }));
  }

  /**
   * Defines a new Room item.
   * @param capacity of room.
   * @param chairs quantity in room.
   * @param desks quantity in room.
   * @param tv quantity in room.
   * @param phoneNumber associated with room.
   * @param dataJacks in room.
   * @return {String} the docID of the new document.
   */
  define({ roomNumber, capacity, chairs, desks, tv, phoneNumber, dataJacks }) {
    const docID = this._collection.insert({
      roomNumber,
      capacity,
      chairs,
      desks,
      tv,
      phoneNumber,
      dataJacks,
    });
    return docID;
  }

  /**
   * Updates the given document.
   * @param capacity of room.
   * @param chairs quantity in room.
   * @param desks quantity in room.
   * @param tv quantity in room.
   * @param phoneNumber associated with room.
   * @param dataJacks in room.
   */
  update(docID, { roomNumber, capacity, chairs, desks, tv, phoneNumber, dataJacks }) {
    const updateData = {};
    if (roomNumber) {
      updateData.roomNumber = roomNumber;
    }
    if (_.isNumber(capacity)) {
      updateData.capacity = capacity;
    }
    if (_.isNumber(chairs)) {
      updateData.chairs = chairs;
    }
    if (_.isNumber(desks)) {
      updateData.desks = desks;
    }
    if (tv) {
      updateData.tv = tv;
    }
    if (phoneNumber) {
      updateData.phoneNumber = phoneNumber;
    }
    if (dataJacks) {
      updateData.dataJacks = dataJacks;
    }
    this._collection.update(docID, { $set: updateData });
  }

  /**
   * A stricter form of remove that throws an error if the document or docID could not be found in this collection.
   * @param { String | Object } name A document or docID in this collection.
   * @returns true
   */
  removeIt(name) {
    const doc = this.findDoc(name);
    check(doc, Object);
    this._collection.remove(doc._id);
    return true;
  }

  /**
   * Default publication method for entities.
   * It publishes the entire collection for admin and the room associated to an owner.
   */
  publish() {
    if (Meteor.isServer) {
      // get the StuffCollection instance.
      const instance = this;
      /** This subscription publishes only the documents associated with the logged in user */
      Meteor.publish(roomResourcePublications.resource, function publish() {
        if (this.userId) {
          return instance._collection.find();
        }
        return this.ready();
      });

      /** This subscription publishes all documents regardless of user, but only if the logged in user is the Admin. */
      Meteor.publish(roomResourcePublications.resourceAdmin, function publish() {
        if (this.userId && Roles.userIsInRole(this.userId, ROLE.ADMIN)) {
          return instance._collection.find();
        }
        return this.ready();
      });
    }
  }

  /**
   * Subscription method for room owned by the current user.
   */
  subscribeRoomResource() {
    if (Meteor.isClient) {
      return Meteor.subscribe(roomResourcePublications.resource);
    }
    return null;
  }

  /**
   * Subscription method for admin users.
   * It subscribes to the entire collection.
   */
  subscribeRoomResourceAdmin() {
    if (Meteor.isClient) {
      return Meteor.subscribe(roomResourcePublications.resourceAdmin);
    }
    return null;
  }

  /**
   * Default implementation of assertValidRoleForMethod. Asserts that userId is logged in as an Admin or User.
   * This is used in the define, update, and removeIt Meteor methods associated with each class.
   * @param userId The userId of the logged in user. Can be null or undefined
   * @throws { Meteor.Error } If there is no logged in user, or the user is not an Admin or User.
   */
  assertValidRoleForMethod(userId) {
    this.assertRole(userId, [ROLE.ADMIN, ROLE.USER]);
  }

  /**
   * Returns an object representing the definition of docID in a format appropriate to the restoreOne or define function.
   * @param docID
   */
  dumpOne(docID) {
    const doc = this.findDoc(docID);
    const roomNumber = doc.roomNumber;
    const capacity = doc.capacity;
    const chairs = doc.chairs;
    const desks = doc.desks;
    const tv = doc.tv;
    const phoneNumber = doc.phoneNumber;
    const dataJacks = doc.dataJacks;
    return { roomNumber, capacity, chairs, desks, tv, phoneNumber, dataJacks };
  }
}

/**
 * Provides the singleton instance of this class to all other entities.
 */
export const RoomResources = new RoomResourceCollection();
