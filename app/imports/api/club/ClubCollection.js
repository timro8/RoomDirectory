import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { check } from 'meteor/check';
import BaseCollection from '../base/BaseCollection';
import { ROLE } from '../role/Role';

export const clubPublications = {
  club: 'Club',
};

class ClubCollection extends BaseCollection {
  constructor() {
    super('Club', new SimpleSchema({
      clubName: String,
      website: String,
      image: String,
      description: String,
      rio: [String],
      advisor: [String],
    }));
  }

  /**
   * Defines a new Club item.
   * @param clubName name of the club.
   * @param website link for the club website.
   * @param image link or reference to image for club.
   * @param description short description of club activities.
   * @param rio array of students in charge of the club.
   * @param advisor array of advisors for the club.
   * @return {String} the docID of the new document.
   */
  define({ clubName, website, image, description, rio, advisor }) {
    const docID = this._collection.insert({
      clubName,
      website,
      image,
      description,
      rio,
      advisor,
    });
    return docID;
  }

  /**
   * Updates the given document.
   * @param docID the id of the document to update.
   * @param clubName name of the club (optional).
   * @param website link for the club website (optional).
   * @param image link or reference to image for club (optional).
   * @param description short description of club activities (optional).
   * @param rio array of students in charge of the club (optional).
   * @param advisor array of advisors for the club (optional).
   */
  update(docID, { clubName, website, image, description, rio, advisor }) {
    const updateData = {};
    if (clubName) {
      updateData.clubName = clubName;
    }
    if (website) {
      updateData.website = website;
    }
    if (image) {
      updateData.image = image;
    }
    if (description) {
      updateData.description = description;
    }
    if (rio) {
      updateData.rio = rio;
    }
    if ((advisor)) {
      updateData.advisor = advisor;
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
   * It publishes the entire collection for all users (no login required).
   */
  publish() {
    if (Meteor.isServer) {
      // get the StuffCollection instance.
      const instance = this;
      /** This subscription publishes only the documents associated with the logged in user */
      Meteor.publish(clubPublications.club, function publish() {
        return instance._collection.find();
      });
    }
  }

  /**
   * Subscription method for clubs in the ICS department.
   */
  subscribeClub() {
    if (Meteor.isClient) {
      return Meteor.subscribe(clubPublications.club);
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
   * @return {{owner: (*|number), condition: *, quantity: *, name}}
   */
  dumpOne(docID) {
    const doc = this.findDoc(docID);
    const clubName = doc.clubName;
    const website = doc.website;
    const image = doc.image;
    const description = doc.description;
    const rio = doc.rio;
    const advisor = doc.advisor;
    return { clubName, website, image, description, rio, advisor };
  }
}

/**
 * Provides the singleton instance of this class to all other entities.
 */
export const Club = new ClubCollection();
